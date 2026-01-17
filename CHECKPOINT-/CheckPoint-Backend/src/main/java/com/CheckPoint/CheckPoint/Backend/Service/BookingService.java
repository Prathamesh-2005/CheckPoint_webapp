package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.UpdateBookingStatusRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.NotificationDto;
import com.CheckPoint.CheckPoint.Backend.Model.*;
import com.CheckPoint.CheckPoint.Backend.Repository.BookingRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BookingService(BookingRepository bookingRepository,
                          RideRepository rideRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Booking createBooking(UUID rideId, User passenger) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found with id: " + rideId));

        if (!ride.getStatus().equals(RideStatus.REQUESTED)) {
            throw new IllegalStateException("This ride is no longer available for booking.");
        }
        if (ride.getDriver().getId().equals(passenger.getId())) {
            throw new IllegalArgumentException("You cannot book your own ride.");
        }
        bookingRepository.findByRideIdAndPassengerId(rideId, passenger.getId()).ifPresent(b -> {
            throw new IllegalStateException("You have already sent a request for this ride.");
        });

        Booking newBooking = new Booking();
        newBooking.setRide(ride);
        newBooking.setPassenger(passenger);
        newBooking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(newBooking);

        // Send notification to driver
        sendBookingRequestNotification(savedBooking);

        return savedBooking;
    }

    @Transactional
    public Booking updateBookingStatus(UUID bookingId, UpdateBookingStatusRequest request, User driver) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + bookingId));

        Ride ride = booking.getRide();

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this booking.");
        }

        String notificationMessage;
        String notificationType;

        if (request.getStatus() == BookingStatus.ACCEPTED) {
            if (!ride.getStatus().equals(RideStatus.REQUESTED)) {
                throw new IllegalStateException("This ride has already been confirmed or cancelled.");
            }
            booking.setStatus(BookingStatus.ACCEPTED);
            ride.setStatus(RideStatus.CONFIRMED);

            List<Booking> otherPendingBookings = bookingRepository.findByRideAndStatus(ride, BookingStatus.PENDING);
            for (Booking otherBooking : otherPendingBookings) {
                if (!otherBooking.getId().equals(booking.getId())) {
                    otherBooking.setStatus(BookingStatus.REJECTED);
                    bookingRepository.save(otherBooking);
                    sendBookingResponseNotification(otherBooking, "BOOKING_REJECTED",
                            "Another passenger's request for this ride was accepted.");
                }
            }

            notificationMessage = "Your ride request has been accepted by " + driver.getFirstName();
            notificationType = "BOOKING_ACCEPTED";

        } else if (request.getStatus() == BookingStatus.REJECTED) {
            booking.setStatus(BookingStatus.REJECTED);
            notificationMessage = "Your ride request was rejected by " + driver.getFirstName();
            notificationType = "BOOKING_REJECTED";
        } else {
            throw new IllegalArgumentException("Invalid status update provided. Can only be 'ACCEPTED' or 'REJECTED'.");
        }

        rideRepository.save(ride);
        Booking updatedBooking = bookingRepository.save(booking);

        sendBookingResponseNotification(updatedBooking, notificationType, notificationMessage);

        return updatedBooking;
    }

    private void sendBookingRequestNotification(Booking booking) {
        User driver = booking.getRide().getDriver();
        String message = "You have a new ride request from " + booking.getPassenger().getFirstName();

        NotificationDto notification = new NotificationDto(
                "BOOKING_REQUEST",
                message,
                booking.getId(),
                booking.getRide().getId()
        );

        // Enhanced logging
        System.out.println("=====================================");
        System.out.println("SENDING BOOKING REQUEST NOTIFICATION");
        System.out.println("Driver ID: " + driver.getId());
        System.out.println("Driver Username: " + driver.getUsername());
        System.out.println("Driver Email: " + driver.getEmail()); // If applicable
        System.out.println("Destination: /user/" + driver.getUsername() + "/queue/notifications");
        System.out.println("Message: " + message);
        System.out.println("=====================================");

        try {
            // Method 1: Using convertAndSendToUser (recommended)
            messagingTemplate.convertAndSendToUser(
                    driver.getUsername(),
                    "/queue/notifications",
                    notification
            );
            System.out.println("✓ Notification sent successfully using convertAndSendToUser");

            // Alternative Method 2: Using convertAndSend with full path (for debugging)
            // Uncomment if Method 1 doesn't work
            /*
            String fullDestination = "/user/" + driver.getUsername() + "/queue/notifications";
            messagingTemplate.convertAndSend(fullDestination, notification);
            System.out.println("✓ Notification sent successfully using convertAndSend");
            */

        } catch (Exception e) {
            System.err.println("✗ Failed to send notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendBookingResponseNotification(Booking booking, String type, String message) {
        User passenger = booking.getPassenger();

        NotificationDto notification = new NotificationDto(
                type,
                message,
                booking.getId(),
                booking.getRide().getId()
        );

        System.out.println("=====================================");
        System.out.println("SENDING BOOKING RESPONSE NOTIFICATION");
        System.out.println("Passenger ID: " + passenger.getId());
        System.out.println("Passenger Username: " + passenger.getUsername());
        System.out.println("Notification Type: " + type);
        System.out.println("Message: " + message);
        System.out.println("=====================================");

        try {
            messagingTemplate.convertAndSendToUser(
                    passenger.getUsername(),
                    "/queue/notifications",
                    notification
            );
            System.out.println("✓ Response notification sent successfully");
        } catch (Exception e) {
            System.err.println("✗ Failed to send response notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}