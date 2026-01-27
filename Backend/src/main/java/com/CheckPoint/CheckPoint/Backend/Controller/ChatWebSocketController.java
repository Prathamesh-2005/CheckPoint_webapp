package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.ChatMessageRequestDTO;
import com.CheckPoint.CheckPoint.Backend.DTO.ChatMessageResponseDTO;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Repository.UserRepository;
import com.CheckPoint.CheckPoint.Backend.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload ChatMessageRequestDTO dto,
            Principal principal) {
        try {
            // ✅ Extract user from Principal
            String userEmail = principal.getName();
            System.out.println("💬 Chat message from: " + userEmail);

            User sender = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

            System.out.println("✅ Sender found: " + sender.getId());

            ChatMessageResponseDTO response = chatService.sendMessage(
                    dto.getBookingId(),
                    sender,
                    dto.getMessage());

            System.out.println("📤 Broadcasting message to /topic/chat/" + dto.getBookingId());

            messagingTemplate.convertAndSend(
                    "/topic/chat/" + dto.getBookingId(),
                    response);

            System.out.println("✅ Message sent successfully");
        } catch (Exception e) {
            System.err.println("❌ Error sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
