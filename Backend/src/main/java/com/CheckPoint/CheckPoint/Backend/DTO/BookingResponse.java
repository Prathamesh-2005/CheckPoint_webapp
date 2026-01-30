package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Booking;
import com.CheckPoint.CheckPoint.Backend.Model.BookingStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BookingResponse {
    private UUID id;
    private UUID bookingId;
    private UUID rideId;
    private BookingStatus status;
    private LocalDateTime createdAt;

    private PassengerInfo passenger;
    private RideInfo ride;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.bookingId = booking.getId();
        this.rideId = booking.getRide().getId();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();

        if (booking.getPassenger() != null) {
            this.passenger = new PassengerInfo();
            this.passenger.setId(booking.getPassenger().getId());
            this.passenger.setFirstName(booking.getPassenger().getFirstName());
            this.passenger.setLastName(booking.getPassenger().getLastName());
            this.passenger.setEmail(booking.getPassenger().getEmail());
            this.passenger.setProfileImageUrl(booking.getPassenger().getProfileImageUrl());
        }

        if (booking.getRide() != null) {
            this.ride = new RideInfo();
            this.ride.setId(booking.getRide().getId());

            if (booking.getRide().getDriver() != null) {
                DriverInfo driver = new DriverInfo();
                driver.setId(booking.getRide().getDriver().getId());
                driver.setFirstName(booking.getRide().getDriver().getFirstName());
                driver.setLastName(booking.getRide().getDriver().getLastName());
                driver.setEmail(booking.getRide().getDriver().getEmail());
                driver.setProfileImageUrl(booking.getRide().getDriver().getProfileImageUrl());
                this.ride.setDriver(driver);
            }
        }
    }

    @Data
    public static class PassengerInfo {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String profileImageUrl;
    }

    @Data
    public static class RideInfo {
        private UUID id;
        private DriverInfo driver;
    }

    @Data
    public static class DriverInfo {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String profileImageUrl;
    }
}