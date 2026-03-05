package com.shifa.integration.payment;

import com.razorpay.Order;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.shifa.integration.payment.config.RazorpayProperties;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
@ConditionalOnProperty(name = "integration.razorpay.enabled", havingValue = "true")
public class RazorpayClient {

    private final com.razorpay.RazorpayClient client;
    private final RazorpayProperties props;

    public RazorpayClient(RazorpayProperties props) throws RazorpayException {
        this.props  = props;
        this.client = new com.razorpay.RazorpayClient(props.getKeyId(), props.getKeySecret());
    }

    public String createOrder(BigDecimal rupees, String receiptId) throws RazorpayException {
        JSONObject opts = new JSONObject();
        opts.put("amount", rupees.multiply(BigDecimal.valueOf(100)).intValue()); // Convert to paise
        opts.put("currency", props.getCurrency());
        opts.put("receipt", receiptId);
        opts.put("payment_capture", 1);
        Order order = client.orders.create(opts);
        log.info("[Razorpay] Order created. orderId={}, amount={}₹", order.get("id"), rupees);
        return order.get("id");
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject params = new JSONObject();
            params.put("razorpay_order_id",   orderId);
            params.put("razorpay_payment_id",  paymentId);
            params.put("razorpay_signature",   signature);
            Utils.verifyPaymentSignature(params, props.getKeySecret());
            return true;
        } catch (RazorpayException e) {
            log.warn("[Razorpay] Signature verification failed. orderId={}", orderId);
            return false;
        }
    }
}
