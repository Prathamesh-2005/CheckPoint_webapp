package com.CheckPoint.CheckPoint.Backend.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetails {

    @Column(length = 100)
    private String vehicleModel;

    @Column(length = 20)
    private String vehicleNumber;

    @Column(length = 50)
    private String vehicleColor;

    private Boolean isVerified = false;
}
