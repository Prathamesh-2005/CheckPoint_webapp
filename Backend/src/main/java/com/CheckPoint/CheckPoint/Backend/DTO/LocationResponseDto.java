package com.CheckPoint.CheckPoint.Backend.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

public class LocationResponseDto {

    private UUID oderId;
    private UUID rideId;
    private String userType;
    private String userName;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;

    public LocationResponseDto(UUID oderId, UUID rideId, String userType, String userName, 
                                Double latitude, Double longitude, LocalDateTime timestamp) {
        this.oderId = oderId;
        this.rideId = rideId;
        this.userType = userType;
        this.userName = userName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    public UUID getUserId() { return oderId; }
    public void setUserId(UUID oderId) { this.oderId = oderId; }
    public UUID getRideId() { return rideId; }
    public void setRideId(UUID rideId) { this.rideId = rideId; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
