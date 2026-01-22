package com.CheckPoint.CheckPoint.Backend.DTO;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@AllArgsConstructor
@Data
@NoArgsConstructor
public class CreateRideRequest {
    @NotNull(message = "Start latitude cannot be null")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double startLatitude;

    @NotNull(message = "Start longitude cannot be null")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double startLongitude;

    @NotNull(message = "End latitude cannot be null")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double endLatitude;

    @NotNull(message = "End longitude cannot be null")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double endLongitude;

    @NotNull(message = "Departure time cannot be null")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be a positive value")
    private BigDecimal price;

    public @NotNull(message = "Start latitude cannot be null") @Min(value = -90, message = "Latitude must be between -90 and 90") @Max(value = 90, message = "Latitude must be between -90 and 90") Double getStartLatitude() {
        return startLatitude;
    }

    public void setStartLatitude(@NotNull(message = "Start latitude cannot be null") @Min(value = -90, message = "Latitude must be between -90 and 90") @Max(value = 90, message = "Latitude must be between -90 and 90") Double startLatitude) {
        this.startLatitude = startLatitude;
    }

    public @NotNull(message = "Start longitude cannot be null") @Min(value = -180, message = "Longitude must be between -180 and 180") @Max(value = 180, message = "Longitude must be between -180 and 180") Double getStartLongitude() {
        return startLongitude;
    }

    public void setStartLongitude(@NotNull(message = "Start longitude cannot be null") @Min(value = -180, message = "Longitude must be between -180 and 180") @Max(value = 180, message = "Longitude must be between -180 and 180") Double startLongitude) {
        this.startLongitude = startLongitude;
    }

    public @NotNull(message = "End latitude cannot be null") @Min(value = -90, message = "Latitude must be between -90 and 90") @Max(value = 90, message = "Latitude must be between -90 and 90") Double getEndLatitude() {
        return endLatitude;
    }

    public void setEndLatitude(@NotNull(message = "End latitude cannot be null") @Min(value = -90, message = "Latitude must be between -90 and 90") @Max(value = 90, message = "Latitude must be between -90 and 90") Double endLatitude) {
        this.endLatitude = endLatitude;
    }

    public @NotNull(message = "End longitude cannot be null") @Min(value = -180, message = "Longitude must be between -180 and 180") @Max(value = 180, message = "Longitude must be between -180 and 180") Double getEndLongitude() {
        return endLongitude;
    }

    public void setEndLongitude(@NotNull(message = "End longitude cannot be null") @Min(value = -180, message = "Longitude must be between -180 and 180") @Max(value = 180, message = "Longitude must be between -180 and 180") Double endLongitude) {
        this.endLongitude = endLongitude;
    }

    public @NotNull(message = "Departure time cannot be null") @Future(message = "Departure time must be in the future") LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(@NotNull(message = "Departure time cannot be null") @Future(message = "Departure time must be in the future") LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public @NotNull(message = "Price cannot be null") @Positive(message = "Price must be a positive value") BigDecimal getPrice() {
        return price;
    }

    public void setPrice(@NotNull(message = "Price cannot be null") @Positive(message = "Price must be a positive value") BigDecimal price) {
        this.price = price;
    }
}
