package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Booking;
import com.CheckPoint.CheckPoint.Backend.Model.BookingStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BookingResponse {
    private UUID id;
    private UUID passengerId;
    private String passengerName;
    private UUID rideId;
    private RideResponse ride;
    private BookingStatus status;
    private LocalDateTime createdAt;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.passengerId = booking.getPassenger().getId();
        this.passengerName = booking.getPassenger().getFirstName() + " " + booking.getPassenger().getLastName();
        this.rideId = booking.getRide().getId();
        this.ride = new RideResponse(booking.getRide());
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }
}