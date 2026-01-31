package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RideResponse {
    private UUID id;
    private DriverInfo driver;
    private Double startLatitude;
    private Double startLongitude;
    private Double endLatitude;
    private Double endLongitude;
    private LocalDateTime departureTime;
    private BigDecimal price;
    private String status;
    private Integer availableSeats;
    private LocalDateTime createdAt;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal platformFee;
    private BigDecimal driverEarnings;

    public RideResponse(Ride ride) {
        this.id = ride.getId();
        this.startLatitude = ride.getStartLatitude();
        this.startLongitude = ride.getStartLongitude();
        this.endLatitude = ride.getEndLatitude();
        this.endLongitude = ride.getEndLongitude();
        this.departureTime = ride.getDepartureTime();
        this.price = ride.getPrice();
        this.status = ride.getStatus().name();
        this.availableSeats = ride.getAvailableSeats();
        this.createdAt = ride.getCreatedAt();
        this.paymentStatus = ride.getPaymentStatus() != null ? ride.getPaymentStatus().name() : "PENDING"; // ✅ Convert
                                                                                                           // enum to
                                                                                                           // string
        this.paymentMethod = ride.getPaymentMethod();
        this.platformFee = ride.getPlatformFee();
        this.driverEarnings = ride.getDriverEarnings();

        if (ride.getDriver() != null) {
            this.driver = new DriverInfo();
            this.driver.setId(ride.getDriver().getId());
            this.driver.setFirstName(ride.getDriver().getFirstName());
            this.driver.setLastName(ride.getDriver().getLastName());
            this.driver.setEmail(ride.getDriver().getEmail());
            this.driver.setProfileImageUrl(ride.getDriver().getProfileImageUrl());
        }
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
