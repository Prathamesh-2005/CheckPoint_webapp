package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.CreateRideRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.RideResponse;
import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import org.springframework.stereotype.Service;

import java.sql.Driver;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {

    private RideRepository rideRepository;

    public RideService(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
    }

    public Ride createRide(CreateRideRequest request, User driver)
    {
        Ride ride=new Ride();
        ride.setDriver(driver);
        ride.setStartLatitude(request.getStartLatitude());
        ride.setStartLongitude(request.getStartLongitude());
        ride.setEndLatitude(request.getEndLatitude());
        ride.setEndLongitude(request.getEndLongitude());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setPrice(request.getPrice());
        ride.setStatus(RideStatus.REQUESTED);

        return rideRepository.save(ride);
    }

    public List<RideResponse> searchRides(double lat, double lon, double radius) {
        List<Ride> availableRides = rideRepository.findAvailableRidesNearby(lat, lon, radius, LocalDateTime.now());

        return availableRides.stream()
                .map(RideResponse::new)
                .collect(Collectors.toList());
    }


}
