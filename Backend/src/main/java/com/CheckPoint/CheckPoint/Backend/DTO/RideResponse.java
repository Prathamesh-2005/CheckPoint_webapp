package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Ride;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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

    // ✅ REQUIRED by Jackson
    public RideResponse() {}

    public RideResponse(Ride ride) {
        this.id = ride.getId();

        if (ride.getDriver() != null) {
            this.driver = new DriverInfo(
                    ride.getDriver().getId(),
                    ride.getDriver().getFirstName(),
                    ride.getDriver().getLastName(),
                    ride.getDriver().getEmail(),
                    ride.getDriver().getProfileImageUrl()
            );
        }

        this.startLatitude = ride.getStartLatitude();
        this.startLongitude = ride.getStartLongitude();
        this.endLatitude = ride.getEndLatitude();
        this.endLongitude = ride.getEndLongitude();
        this.departureTime = ride.getDepartureTime();
        this.price = ride.getPrice();
        this.status = ride.getStatus() != null ? ride.getStatus().name() : null;
        this.availableSeats = ride.getAvailableSeats();
        this.createdAt = ride.getCreatedAt();
    }

    // -------- getters & setters --------

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public DriverInfo getDriver() { return driver; }
    public void setDriver(DriverInfo driver) { this.driver = driver; }

    public Double getStartLatitude() { return startLatitude; }
    public void setStartLatitude(Double startLatitude) { this.startLatitude = startLatitude; }

    public Double getStartLongitude() { return startLongitude; }
    public void setStartLongitude(Double startLongitude) { this.startLongitude = startLongitude; }

    public Double getEndLatitude() { return endLatitude; }
    public void setEndLatitude(Double endLatitude) { this.endLatitude = endLatitude; }

    public Double getEndLongitude() { return endLongitude; }
    public void setEndLongitude(Double endLongitude) { this.endLongitude = endLongitude; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // ---------- INNER DTO ----------
    public static class DriverInfo {

        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String profileImageUrl;

        // ✅ REQUIRED by Jackson
        public DriverInfo() {}

        public DriverInfo(UUID id, String firstName, String lastName,
                          String email, String profileImageUrl) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.profileImageUrl = profileImageUrl;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getProfileImageUrl() { return profileImageUrl; }
        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    }
}
