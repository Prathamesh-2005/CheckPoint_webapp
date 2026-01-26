package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.NotificationResponse;
import com.CheckPoint.CheckPoint.Backend.Model.Notification;
import com.CheckPoint.CheckPoint.Backend.Model.NotificationType;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void createAndSendNotification(User user, NotificationType type, String title,
            String message, UUID rideId, UUID bookingId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRideId(rideId);
        notification.setBookingId(bookingId);
        notification.setIsRead(false);

        notificationRepository.save(notification);

        NotificationResponse response = new NotificationResponse(notification);
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                response);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(UUID notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true); // Fixed: Changed from setRead() to setIsRead()
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalse(user);
        notifications.forEach(n -> n.setIsRead(true)); // Fixed: Changed from setRead() to setIsRead()
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(UUID notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        notificationRepository.delete(notification);
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }
}