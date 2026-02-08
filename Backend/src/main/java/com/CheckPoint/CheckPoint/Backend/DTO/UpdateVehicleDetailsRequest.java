package com.CheckPoint.CheckPoint.Backend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateVehicleDetailsRequest {

    @NotBlank(message = "Vehicle model is required")
    private String vehicleModel;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    private String vehicleColor;
}
