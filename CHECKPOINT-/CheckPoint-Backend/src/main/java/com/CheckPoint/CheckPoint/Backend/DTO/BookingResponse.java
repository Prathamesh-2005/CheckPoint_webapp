package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Booking;
import com.CheckPoint.CheckPoint.Backend.Model.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingResponse {
    private UUID bookingId;
    private UUID rideId;
    private PassengerDto passenger;
    private BookingStatus status;
    private LocalDateTime createdAt;

    public BookingResponse(Booking booking) {
        this.bookingId = booking.getId();
        this.rideId = booking.getRide().getId();
        this.passenger = new PassengerDto(booking.getPassenger().getId(), booking.getPassenger().getFirstName());
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }

    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public UUID getRideId() { return rideId; }
    public void setRideId(UUID rideId) { this.rideId = rideId; }
    public PassengerDto getPassenger() { return passenger; }
    public void setPassenger(PassengerDto passenger) { this.passenger = passenger; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}