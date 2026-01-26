package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.CreateRideRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.RideResponse;
import com.CheckPoint.CheckPoint.Backend.Model.*;
import com.CheckPoint.CheckPoint.Backend.Repository.BookingRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {
    private final RideRepository rideRepository;
    private final NotificationService notificationService;
    private final BookingRepository bookingRepository;

    public RideService(RideRepository rideRepository, NotificationService notificationService,
            BookingRepository bookingRepository) {
        this.rideRepository = rideRepository;
        this.notificationService = notificationService;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public RideResponse createRideWithResponse(CreateRideRequest request, User driver) {
        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setStartLatitude(request.getStartLatitude());
        ride.setStartLongitude(request.getStartLongitude());
        ride.setEndLatitude(request.getEndLatitude());
        ride.setEndLongitude(request.getEndLongitude());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setPrice(request.getPrice());
        ride.setStatus(RideStatus.AVAILABLE);
        ride.setAvailableSeats(1);

        Ride savedRide = rideRepository.save(ride);

        // Force initialization of driver BEFORE transaction ends
        savedRide.getDriver().getId();
        savedRide.getDriver().getFirstName();
        savedRide.getDriver().getLastName();
        savedRide.getDriver().getEmail();
        savedRide.getDriver().getProfileImageUrl();

        // Create DTO within transaction scope
        return new RideResponse(savedRide);
    }

    @Transactional
    public List<RideResponse> searchRides(
            double startLat, double startLng,
            double destLat, double destLng,
            double radius) {

        LocalDateTime now = LocalDateTime.now();

        System.out.println("🔍 Search parameters:");
        System.out.println("   Pickup: " + startLat + ", " + startLng);
        System.out.println("   Destination: " + destLat + ", " + destLng);
        System.out.println("   Radius: " + radius + " km");
        System.out.println("   Current time: " + now);

        // TEST: Try getting ALL available rides first (ignore location)
        List<Ride> allAvailable = rideRepository.findAll().stream()
                .filter(r -> r.getStatus() == RideStatus.AVAILABLE)
                .filter(r -> r.getDepartureTime().isAfter(now))
                .filter(r -> r.getAvailableSeats() > 0)
                .collect(Collectors.toList());

        System.out.println("\n📊 ALL AVAILABLE rides (ignoring location): " + allAvailable.size());

        // Now try the actual query
        List<Ride> availableRides = rideRepository.findAvailableRidesNearby(
                startLat, startLng, radius,
                destLat, destLng, radius,
                now);

        System.out.println("📊 Query returned: " + availableRides.size() + " rides");

        // If query returns 0 but manual check found rides, there's a query issue
        if (availableRides.isEmpty() && !allAvailable.isEmpty()) {
            System.out
                    .println("⚠️ WARNING: Query returned 0 but manual check found " + allAvailable.size() + " rides!");
            System.out.println("⚠️ This means the SQL distance calculation is failing!");

            // Return the manually filtered results for now
            availableRides = allAvailable.stream()
                    .filter(r -> {
                        double distStart = calculateDistance(startLat, startLng, r.getStartLatitude(),
                                r.getStartLongitude());
                        double distEnd = calculateDistance(destLat, destLng, r.getEndLatitude(), r.getEndLongitude());
                        return distStart <= radius && distEnd <= radius;
                    })
                    .collect(Collectors.toList());

            System.out.println("✅ Using Java-calculated distance, found: " + availableRides.size() + " rides");
        }

        // Force initialize driver for all rides
        availableRides.forEach(ride -> {
            ride.getDriver().getId();
            ride.getDriver().getFirstName();
            ride.getDriver().getLastName();
        });

        return availableRides.stream()
                .map(RideResponse::new)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Transactional
    public RideResponse getRideById(UUID rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found with id: " + rideId));

        // Force initialize driver
        ride.getDriver().getId();
        ride.getDriver().getFirstName();

        return new RideResponse(ride);
    }

    public Ride getRideEntityById(UUID rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found with id: " + rideId));
    }

    public List<RideResponse> getDriverRides(User driver) {
        List<Ride> driverRides = rideRepository.findByDriverOrderByCreatedAtDesc(driver);

        // ✅ Also get rides where user is a passenger
        List<Booking> passengerBookings = bookingRepository.findByPassengerOrderByCreatedAtDesc(driver);
        List<Ride> passengerRides = passengerBookings.stream()
                .map(Booking::getRide)
                .collect(Collectors.toList());

        // Combine both lists
        Set<Ride> allRides = new LinkedHashSet<>();
        allRides.addAll(driverRides);
        allRides.addAll(passengerRides);

        return allRides.stream()
                .map(RideResponse::new)
                .collect(Collectors.toList());
    }

    public List<RideResponse> getDriverRidesByStatus(User driver, RideStatus status) {
        List<Ride> rides = rideRepository.findByDriverAndStatusOrderByCreatedAtDesc(driver, status);
        return rides.stream()
                .map(RideResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
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

        Booking booking = bookingRepository.findByRideAndStatus(savedRide, BookingStatus.ACCEPTED)
                .stream().findFirst().orElse(null);

        if (booking != null) {
            notificationService.createAndSendNotification(
                    booking.getPassenger(),
                    NotificationType.RIDE_CANCELLED,
                    "Ride Cancelled",
                    driver.getFirstName() + " has cancelled the ride",
                    savedRide.getId(),
                    booking.getId());
        }

        return new RideResponse(savedRide);
    }

    @Transactional
    public RideResponse startRide(UUID rideId, User driver) {
        System.out.println("🚗 Starting ride: " + rideId);
        Ride ride = getRideEntityById(rideId);

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You are not the driver of this ride");
        }

        if (ride.getStatus() != RideStatus.AVAILABLE && ride.getStatus() != RideStatus.CONFIRMED) {
            throw new RuntimeException("Cannot start ride with status: " + ride.getStatus());
        }

        ride.setStatus(RideStatus.IN_PROGRESS);
        Ride savedRide = rideRepository.save(ride);

        System.out.println("✅ Ride started successfully");
        return new RideResponse(savedRide);
    }

    @Transactional
    public RideResponse completeRide(UUID rideId, User driver) {
        System.out.println("🏁 Completing ride: " + rideId);
        Ride ride = getRideEntityById(rideId);

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You are not the driver of this ride");
        }

        if (ride.getStatus() != RideStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only complete rides that are in progress");
        }

        ride.setStatus(RideStatus.COMPLETED);
        Ride savedRide = rideRepository.save(ride);

        // ✅ Notify all passengers that ride is completed
        List<Booking> bookings = bookingRepository.findByRideAndStatus(ride, BookingStatus.ACCEPTED);
        for (Booking booking : bookings) {
            notificationService.createAndSendNotification(
                    booking.getPassenger(),
                    NotificationType.RIDE_COMPLETED,
                    "Ride Completed!",
                    "Your ride has been completed. Please proceed to payment.",
                    ride.getId(),
                    booking.getId());
        }

        System.out.println("✅ Ride completed successfully");
        return new RideResponse(savedRide);
    }

    private void validateDriverOwnership(Ride ride, User driver) {
        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this ride.");
        }
    }
}
