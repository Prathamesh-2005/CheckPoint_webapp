package com.CheckPoint.CheckPoint.Backend.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Ride ID is required")
    private UUID rideId;
}
