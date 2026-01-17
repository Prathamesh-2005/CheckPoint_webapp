package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RideResponse {
    private UUID id;
    private DriverDto driver;
    private Double startLatitude;
    private Double startLongitude;
    private Double endLatitude;
    private Double endLongitude;
    private LocalDateTime departureTime;
    private BigDecimal price;
    private RideStatus status;
    private Integer availableSeats;

    public RideResponse(Ride ride) {
        this.id = ride.getId();

        if (ride.getDriver() != null) {
            this.driver = new DriverDto(
                    ride.getDriver().getId(),
                    ride.getDriver().getFirstName()
            );
        }

        this.startLatitude = ride.getStartLatitude();
        this.startLongitude = ride.getStartLongitude();
        this.endLatitude = ride.getEndLatitude();
        this.endLongitude = ride.getEndLongitude();
        this.departureTime = ride.getDepartureTime();
        this.price = ride.getPrice();
        this.status = ride.getStatus();
        this.availableSeats = ride.getAvailableSeats();
    }

}
