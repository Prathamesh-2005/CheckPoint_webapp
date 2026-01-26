package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.UpdateBookingStatusRequest;
import com.CheckPoint.CheckPoint.Backend.Model.*;
import com.CheckPoint.CheckPoint.Backend.Repository.BookingRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
            RideRepository rideRepository,
            SimpMessagingTemplate messagingTemplate,
            NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @Transactional
    public Booking createBooking(UUID rideId, User passenger) {
        System.out.println("🎫 Creating booking for ride: " + rideId);
        System.out.println("   Passenger: " + passenger.getEmail());

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found with id: " + rideId));

        System.out.println("   Ride driver: " + ride.getDriver().getEmail());
        System.out.println("   Ride status: " + ride.getStatus());
        System.out.println("   Available seats: " + ride.getAvailableSeats());

        // Check if passenger is trying to book their own ride
        if (ride.getDriver().getId().equals(passenger.getId())) {
            System.out.println("❌ ERROR: Driver trying to book own ride!");
            throw new IllegalStateException("You cannot book your own ride.");
        }

        // Check if ride is available
        if (ride.getStatus() != RideStatus.AVAILABLE) {
            System.out.println("❌ ERROR: Ride status is " + ride.getStatus() + ", not AVAILABLE");
            throw new IllegalStateException("This ride is no longer available for booking.");
        }

        // Check if seats available
        if (ride.getAvailableSeats() <= 0) {
            System.out.println("❌ ERROR: No seats available!");
            throw new IllegalStateException("This ride has no available seats.");
        }

        // Check if passenger already has a booking
        Optional<Booking> existingBooking = bookingRepository.findByRideAndPassenger(ride, passenger);
        if (existingBooking.isPresent()) {
            System.out.println("❌ ERROR: Passenger already booked this ride!");
            throw new IllegalStateException("You have already booked this ride.");
        }

        System.out.println("✅ All validations passed, creating booking...");

        Booking newBooking = new Booking();
        newBooking.setRide(ride);
        newBooking.setPassenger(passenger);
        newBooking.setStatus(BookingStatus.REQUESTED);

        Booking savedBooking = bookingRepository.save(newBooking);

        System.out.println("✅ Booking created successfully: " + savedBooking.getId());

        // Send notification to driver
        notificationService.createAndSendNotification(
                ride.getDriver(),
                NotificationType.BOOKING_REQUEST,
                "New Booking Request",
                passenger.getFirstName() + " wants to ride with you",
                ride.getId(),
                savedBooking.getId());

        return savedBooking;
    }

    @Transactional
    public Booking updateBookingStatus(UUID bookingId, UpdateBookingStatusRequest request, User driver) {
        System.out.println("🔄 Updating booking status: " + bookingId);
        System.out.println("   Driver: " + driver.getEmail());
        System.out.println("   Requested status: " + request.getStatus());

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Ride ride = booking.getRide();

        if (!ride.getDriver().getId().equals(driver.getId())) {
            System.out.println("❌ Unauthorized: Not the driver of this ride");
            throw new RuntimeException("You are not authorized to modify this booking");
        }

        if (booking.getStatus() != BookingStatus.REQUESTED) {
            System.out.println("❌ Booking already processed");
            System.out.println("   Current status: " + booking.getStatus());
            throw new IllegalStateException(
                    "This booking has already been " + booking.getStatus().name().toLowerCase() +
                            ". Current status: " + booking.getStatus());
        }

        System.out.println("✅ Booking status valid, updating...");

        // ✅ Fixed: request.getStatus() returns String, so we need to parse it
        BookingStatus newStatus = BookingStatus.valueOf(request.getStatus().toUpperCase());
        booking.setStatus(newStatus);
        Booking savedBooking = bookingRepository.save(booking);

        if (newStatus == BookingStatus.ACCEPTED) {
            // ✅ Change ride status to CONFIRMED when booking is accepted
            ride.setStatus(RideStatus.CONFIRMED);
            ride.setAvailableSeats(ride.getAvailableSeats() - 1);
            rideRepository.save(ride);

            notificationService.createAndSendNotification(
                    booking.getPassenger(),
                    NotificationType.BOOKING_CONFIRMED,
                    "Booking Confirmed!",
                    "Your ride request has been accepted by " + driver.getFirstName(),
                    ride.getId(),
                    booking.getId());
        } else if (newStatus == BookingStatus.REJECTED) {
            notificationService.createAndSendNotification(
                    booking.getPassenger(),
                    NotificationType.BOOKING_REJECTED,
                    "Booking Rejected",
                    "Your ride request was declined",
                    ride.getId(),
                    booking.getId());
        }

        System.out.println("✅ Booking updated successfully to: " + newStatus);
        return savedBooking;
    }

    public Booking getBookingByRideAndPassenger(UUID rideId, User passenger) {
        return bookingRepository.findByRideIdAndPassengerId(rideId, passenger.getId())
                .orElse(null);
    }

    public List<Booking> getPassengerBookings(User passenger) {
        return bookingRepository.findByPassengerOrderByCreatedAtDesc(passenger);
    }

    private void sendBookingRequestNotification(Booking booking) {
        User driver = booking.getRide().getDriver();
        String title = "New Ride Request";
        String message = booking.getPassenger().getFirstName() + " " +
                booking.getPassenger().getLastName() +
                " wants to book your ride";

        notificationService.createAndSendNotification(
                driver,
                NotificationType.BOOKING_REQUEST,
                title,
                message,
                booking.getRide().getId(),
                booking.getId());
    }

    private void sendBookingResponseNotification(Booking booking, String type, String message) {
        User passenger = booking.getPassenger();
        NotificationType notificationType = type.equals("BOOKING_ACCEPTED")
                ? NotificationType.BOOKING_ACCEPTED
                : NotificationType.BOOKING_REJECTED;

        String title = type.equals("BOOKING_ACCEPTED")
                ? "Booking Accepted"
                : "Booking Rejected";

        notificationService.createAndSendNotification(
                passenger,
                notificationType,
                title,
                message,
                booking.getRide().getId(),
                booking.getId());
    }
}