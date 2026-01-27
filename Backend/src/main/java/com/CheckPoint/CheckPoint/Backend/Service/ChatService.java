package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.ChatMessageResponseDTO;
import com.CheckPoint.CheckPoint.Backend.Model.Booking;
import com.CheckPoint.CheckPoint.Backend.Model.ChatMessage;
import com.CheckPoint.CheckPoint.Backend.Model.ChatRoom;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Repository.BookingRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.ChatMessageRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.ChatRoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {
        private final BookingRepository bookingRepo;
        private final ChatRoomRepository chatRoomRepo;
        private final ChatMessageRepository chatMessageRepo;

        @Transactional
        public ChatMessageResponseDTO sendMessage(UUID bookingId, User sender, String message) {
                Booking booking = bookingRepo.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                UUID passengerId = booking.getPassenger().getId();
                UUID driverId = booking.getRide().getDriver().getId();

                if (!sender.getId().equals(passengerId) && !sender.getId().equals(driverId)) {
                        throw new RuntimeException("Unauthorized chat access");
                }

                ChatRoom chatRoom = chatRoomRepo.findByBooking_Id(bookingId)
                                .orElseGet(() -> {
                                        ChatRoom newRoom = new ChatRoom();
                                        newRoom.setBooking(booking);
                                        return chatRoomRepo.save(newRoom);
                                });

                ChatMessage chatMessage = new ChatMessage();
                chatMessage.setChatRoom(chatRoom);
                chatMessage.setSender(sender);
                chatMessage.setMessage(message);
                chatMessage.setSentAt(java.time.LocalDateTime.now());

                chatMessageRepo.save(chatMessage);

                return new ChatMessageResponseDTO(
                                chatMessage.getId(),
                                sender.getId(),
                                message,
                                chatMessage.getSentAt());
        }

        public List<ChatMessageResponseDTO> getChatHistory(UUID bookingId, User user) {
                Booking booking = bookingRepo.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                UUID passengerId = booking.getPassenger().getId();
                UUID driverId = booking.getRide().getDriver().getId();

                if (!user.getId().equals(passengerId) && !user.getId().equals(driverId)) {
                        throw new RuntimeException("Unauthorized chat access");
                }

                // ✅ FIXED: If chat room doesn't exist yet, return empty list instead of error
                ChatRoom chatRoom = chatRoomRepo.findByBooking_Id(bookingId).orElse(null);

                if (chatRoom == null) {
                        System.out.println("💬 No chat room found for booking: " + bookingId
                                        + ", returning empty history");
                        return List.of(); // Return empty list, room will be created on first message
                }

                return chatMessageRepo.findByChatRoom_IdOrderBySentAtAsc(chatRoom.getId())
                                .stream()
                                .map(m -> new ChatMessageResponseDTO(
                                                m.getId(),
                                                m.getSender().getId(),
                                                m.getMessage(),
                                                m.getSentAt()))
                                .toList();
        }
}
