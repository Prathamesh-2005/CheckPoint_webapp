package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.NotificationResponse;
import com.CheckPoint.CheckPoint.Backend.Model.Notification;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins =
        {
                "http://127.0.0.1:5500/","http://localhost:5173/"
        })
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationService.getUserNotifications(user);
        List<NotificationResponse> response = notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationService.getUnreadNotifications(user);
        List<NotificationResponse> response = notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal User user) {
        Notification notification = notificationService.markAsRead(notificationId, user);
        return ResponseEntity.ok(new NotificationResponse(notification));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal User user) {
        notificationService.deleteNotification(notificationId, user);
        return ResponseEntity.ok().build();
    }
}