package com.shifa.integration.ocr;

import org.springframework.stereotype.Component;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.awt.image.RescaleOp;

@Component
public class ImagePreprocessor {

    public BufferedImage preprocess(BufferedImage src) {
        return ensureMinWidth(enhanceContrast(toGrayscale(src)));
    }

    private BufferedImage toGrayscale(BufferedImage img) {
        BufferedImage gray = new BufferedImage(
            img.getWidth(), img.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(img, 0, 0, null);
        g.dispose();
        return gray;
    }

    private BufferedImage enhanceContrast(BufferedImage img) {
        return new RescaleOp(1.4f, -20f, null).filter(img, null);
    }

    private BufferedImage ensureMinWidth(BufferedImage img) {
        int MIN = 1000;
        if (img.getWidth() >= MIN) return img;
        int newH = (int)(img.getHeight() * (double) MIN / img.getWidth());
        BufferedImage scaled = new BufferedImage(MIN, newH, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = scaled.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                           RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.drawImage(img, 0, 0, MIN, newH, null);
        g.dispose();
        return scaled;
    }
}
