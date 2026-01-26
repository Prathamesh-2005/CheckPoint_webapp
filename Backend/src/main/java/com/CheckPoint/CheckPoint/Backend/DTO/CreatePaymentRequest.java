package com.CheckPoint.CheckPoint.Backend.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Ride ID is required")
    private UUID rideId;

    public @NotNull(message = "Ride ID is required") UUID getRideId() {
        return rideId;
    }

    public void setRideId(@NotNull(message = "Ride ID is required") UUID rideId) {
        this.rideId = rideId;
    }
}
