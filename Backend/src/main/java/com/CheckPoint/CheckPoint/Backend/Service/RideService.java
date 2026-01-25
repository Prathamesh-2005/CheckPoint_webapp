package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.CreateRideRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.RideResponse;
import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class RideService {

    private final RideRepository rideRepository;

    public RideService(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
    }

    public Ride createRide(CreateRideRequest request, User driver) {
        Ride ride = new Ride();
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

    public RideResponse getRideById(UUID rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found with id: " + rideId));
        return new RideResponse(ride);
    }

    public Ride getRideEntityById(UUID rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found with id: " + rideId));
    }

    public List<RideResponse> getDriverRides(User driver) {
        List<Ride> rides = rideRepository.findByDriverOrderByCreatedAtDesc(driver);
        return rides.stream()
                .map(RideResponse::new)
                .collect(Collectors.toList());
    }

    public List<RideResponse> getDriverRidesByStatus(User driver, RideStatus status) {
        List<Ride> rides = rideRepository.findByDriverAndStatusOrderByCreatedAtDesc(driver, status);
        return rides.stream()
                .map(RideResponse::new)
                .collect(Collectors.toList());
    }

    public RideResponse cancelRide(UUID rideId, User driver) {
        Ride ride = getRideEntityById(rideId);
        
        validateDriverOwnership(ride, driver);
        
        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed ride.");
        }
        if (ride.getStatus() == RideStatus.CANCELLED) {
            throw new IllegalStateException("Ride is already cancelled.");
        }
        if (ride.getStatus() == RideStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot cancel a ride that is in progress.");
        }

        ride.setStatus(RideStatus.CANCELLED);
        Ride savedRide = rideRepository.save(ride);
        return new RideResponse(savedRide);
    }

    public RideResponse startRide(UUID rideId, User driver) {
        Ride ride = getRideEntityById(rideId);
        
        validateDriverOwnership(ride, driver);

        if (ride.getStatus() != RideStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed rides can be started. Current status: " + ride.getStatus());
        }

        ride.setStatus(RideStatus.IN_PROGRESS);
        Ride savedRide = rideRepository.save(ride);
        return new RideResponse(savedRide);
    }


@Transactional
public RideResponse completeRide(UUID rideId, User driver) {
    Ride ride = rideRepository.findById(rideId)
            .orElseThrow(() -> new RuntimeException("Ride not found"));

    if (!ride.getDriver().getId().equals(driver.getId())) {
        throw new RuntimeException("Unauthorized: You are not the driver of this ride");
    }

    if (!ride.getStatus().equals(RideStatus.IN_PROGRESS)) {
        throw new RuntimeException("Ride is not in progress");
    }

    ride.setStatus(RideStatus.COMPLETED);
    
    Ride savedRide = rideRepository.save(ride);
    return new RideResponse(savedRide);
}

    private void validateDriverOwnership(Ride ride, User driver) {
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this ride.");
        }
    }
}
