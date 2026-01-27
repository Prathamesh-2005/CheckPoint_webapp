package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.LocationResponseDto;
import com.CheckPoint.CheckPoint.Backend.DTO.LocationUpdateDto;
import com.CheckPoint.CheckPoint.Backend.Model.*;
import com.CheckPoint.CheckPoint.Backend.Repository.BookingRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.RideLocationRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class LocationTrackingService {

    private final RideLocationRepository locationRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public LocationTrackingService(RideLocationRepository locationRepository,
            RideRepository rideRepository,
            BookingRepository bookingRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.locationRepository = locationRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public LocationResponseDto updateLocation(LocationUpdateDto dto, User user) {
        Ride ride = rideRepository.findById(dto.getRideId())
                .orElseThrow(() -> new EntityNotFoundException("Ride not found"));

        boolean isDriver = ride.getDriver().getId().equals(user.getId());
        boolean isPassenger = bookingRepository.findByRideIdAndPassengerId(ride.getId(), user.getId())
                .map(b -> b.getStatus() == BookingStatus.ACCEPTED)
                .orElse(false);

        if (!isDriver && !isPassenger) {
            throw new AccessDeniedException("You are not authorized to update location for this ride");
        }

        if (ride.getStatus() != RideStatus.CONFIRMED && ride.getStatus() != RideStatus.IN_PROGRESS) {
            throw new IllegalStateException("Location tracking is only available for confirmed or in-progress rides");
        }

        RideLocation location = new RideLocation();
        location.setRide(ride);
        location.setUser(user);
        location.setLatitude(dto.getLatitude());
        location.setLongitude(dto.getLongitude());
        location.setTimestamp(LocalDateTime.now());
        locationRepository.save(location);

        String userType = isDriver ? "DRIVER" : "PASSENGER";
        LocationResponseDto response = new LocationResponseDto(
                user.getId(),
                ride.getId(),
                userType,
                user.getFirstName(),
                dto.getLatitude(),
                dto.getLongitude(),
                LocalDateTime.now());

        if (isDriver) {
            bookingRepository.findByRideIdAndPassengerId(ride.getId(), user.getId());
            sendLocationToRideParticipants(ride, response, false);
        } else {
            sendLocationToRideParticipants(ride, response, true);
        }

        return response;
    }

    private void sendLocationToRideParticipants(Ride ride, LocationResponseDto location, boolean toDriver) {
        String destination = "/queue/location";

        if (toDriver) {
            messagingTemplate.convertAndSendToUser(
                    ride.getDriver().getUsername(),
                    destination,
                    location);
            System.out.println("Location sent to driver: " + ride.getDriver().getUsername());
        } else {
            bookingRepository.findByRideAndStatus(ride, BookingStatus.ACCEPTED)
                    .forEach(booking -> {
                        messagingTemplate.convertAndSendToUser(
                                booking.getPassenger().getUsername(),
                                destination,
                                location);
                        System.out.println("Location sent to passenger: " + booking.getPassenger().getUsername());
                    });
        }
    }

    @Transactional(readOnly = true)
    public LocationResponseDto getDriverLocation(UUID rideId, User user) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found"));

        boolean isPassenger = bookingRepository.findByRideIdAndPassengerId(ride.getId(), user.getId())
                .map(b -> b.getStatus() == BookingStatus.ACCEPTED)
                .orElse(false);

        if (!isPassenger) {
            throw new AccessDeniedException("You are not authorized to view driver location");
        }

        RideLocation location = locationRepository.findLatestByRideIdAndUserId(rideId, ride.getDriver().getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver location not available"));

        return new LocationResponseDto(
                ride.getDriver().getId(),
                rideId,
                "DRIVER",
                ride.getDriver().getFirstName(),
                location.getLatitude(),
                location.getLongitude(),
                location.getTimestamp());
    }

    @Transactional(readOnly = true)
    public LocationResponseDto getPassengerLocation(UUID rideId, User driver) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new AccessDeniedException("You are not authorized to view passenger location");
        }

        Booking acceptedBooking = bookingRepository.findByRideAndStatus(ride, BookingStatus.ACCEPTED)
                .stream().findFirst()
                .orElseThrow(() -> new EntityNotFoundException("No accepted passenger for this ride"));

        RideLocation location = locationRepository
                .findLatestByRideIdAndUserId(rideId, acceptedBooking.getPassenger().getId())
                .orElseThrow(() -> new EntityNotFoundException("Passenger location not available"));

        return new LocationResponseDto(
                acceptedBooking.getPassenger().getId(),
                rideId,
                "PASSENGER",
                acceptedBooking.getPassenger().getFirstName(),
                location.getLatitude(),
                location.getLongitude(),
                location.getTimestamp());
    }
}
