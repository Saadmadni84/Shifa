package com.shifa.integration.sms;

import com.shifa.integration.sms.config.TwilioProperties;
import com.shifa.integration.sms.exception.SmsDeliveryException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Base64;

@Component
@Slf4j
public class TwilioSmsClient {

    private final WebClient webClient;
    private final TwilioProperties props;

    public TwilioSmsClient(TwilioProperties props) {
        this.props = props;
        String creds = Base64.getEncoder().encodeToString(
            (props.getAccountSid() + ":" + props.getAuthToken()).getBytes());

        this.webClient = WebClient.builder()
            .baseUrl(props.getBaseUrl())
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + creds)
            .defaultHeader(HttpHeaders.CONTENT_TYPE,
                           MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            .build();
    }

    public void send(String to, String body) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("To",   normalizeForTwilio(to));
        form.add("From", props.getFromNumber());
        form.add("Body", body);

        webClient.post()
            .uri("/Accounts/{sid}/Messages.json", props.getAccountSid())
            .bodyValue(form)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, res ->
                res.bodyToMono(String.class)
                    .flatMap(err -> Mono.error(new SmsDeliveryException("Twilio 4xx: " + err))))
            .bodyToMono(String.class)
            .timeout(Duration.ofSeconds(15))
            .retryWhen(Retry.backoff(2, Duration.ofSeconds(3)))
            .block();

        log.info("[Twilio] SMS dispatched to {}", to);
    }

    private String normalizeForTwilio(String phone) {
        if (phone == null) return null;
        String c = phone.replaceAll("[\\s\\-()]+", "");
        if (c.matches("^[6-9]\\d{9}$")) return "+91" + c;
        if (!c.startsWith("+")) return "+" + c;
        return c;
    }
}
