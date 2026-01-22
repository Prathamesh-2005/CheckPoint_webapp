package com.CheckPoint.CheckPoint.Backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:8080/reset-password?token=" + token;
        String subject = "Password Reset Request";
        String text = "To reset your password, click the link below:\n" + resetUrl +
                "\n\nThis link will expire in 24 hours.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
