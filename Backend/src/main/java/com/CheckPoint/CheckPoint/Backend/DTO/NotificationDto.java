package com.CheckPoint.CheckPoint.Backend.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationDto {

    private String type;
    private String message;
    private UUID bookingId;
    private UUID rideId;
    private LocalDateTime timestamp;

    public NotificationDto(String type, String message, UUID bookingId, UUID rideId) {
        this.type = type;
        this.message = message;
        this.bookingId = bookingId;
        this.rideId = rideId;
        this.timestamp = LocalDateTime.now();
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public UUID getRideId() { return rideId; }
    public void setRideId(UUID rideId) { this.rideId = rideId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
