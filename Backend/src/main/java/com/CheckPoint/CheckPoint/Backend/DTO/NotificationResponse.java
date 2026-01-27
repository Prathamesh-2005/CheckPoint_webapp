package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Notification;
import com.CheckPoint.CheckPoint.Backend.Model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private String type;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private UUID rideId;
    private UUID bookingId;
    private boolean actionRequired; // Add this

    public NotificationResponse() {
    }

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType().name();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.read = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
        this.rideId = notification.getRideId();
        this.bookingId = notification.getBookingId();

        this.actionRequired = notification.getType() == NotificationType.BOOKING_REQUEST;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UUID getRideId() {
        return rideId;
    }

    public void setRideId(UUID rideId) {
        this.rideId = rideId;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }

    public boolean isActionRequired() {
        return actionRequired;
    }

    public void setActionRequired(boolean actionRequired) {
        this.actionRequired = actionRequired;
    }
}
