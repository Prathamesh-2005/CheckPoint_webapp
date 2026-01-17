package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.BookingResponse;
import com.CheckPoint.CheckPoint.Backend.DTO.UpdateBookingStatusRequest;
import com.CheckPoint.CheckPoint.Backend.Model.Booking;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Service.BookingService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin("http://127.0.0.1:5500/")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/rides/{rideId}/bookings")
    public ResponseEntity<?> requestRide(
            @PathVariable UUID rideId,
            @AuthenticationPrincipal User passenger,
            HttpServletRequest request
    ) {
        try {
            Booking newBooking = bookingService.createBooking(rideId, passenger);
            return new ResponseEntity<>(new BookingResponse(newBooking), HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("timestamp", LocalDateTime.now().toString());
            errorBody.put("status", HttpStatus.NOT_FOUND.value());
            errorBody.put("error", "Not Found");
            errorBody.put("message", e.getMessage());
            errorBody.put("path", request.getRequestURI());
            return new ResponseEntity<>(errorBody, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("timestamp", LocalDateTime.now().toString());
            errorBody.put("status", HttpStatus.BAD_REQUEST.value());
            errorBody.put("error", "Bad Request");
            errorBody.put("message", e.getMessage());
            errorBody.put("path", request.getRequestURI());
            return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/bookings/{bookingId}")
    public ResponseEntity<?> respondToBooking(
            @PathVariable UUID bookingId,
            @Valid @RequestBody UpdateBookingStatusRequest statusRequest,
            @AuthenticationPrincipal User driver,
            HttpServletRequest request
    ) {
        try {
            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, statusRequest, driver);
            return ResponseEntity.ok(new BookingResponse(updatedBooking));
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("timestamp", LocalDateTime.now().toString());
            errorBody.put("status", HttpStatus.NOT_FOUND.value());
            errorBody.put("error", "Not Found");
            errorBody.put("message", e.getMessage());
            errorBody.put("path", request.getRequestURI());
            return new ResponseEntity<>(errorBody, HttpStatus.NOT_FOUND);
        } catch (AccessDeniedException e) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("timestamp", LocalDateTime.now().toString());
            errorBody.put("status", HttpStatus.FORBIDDEN.value());
            errorBody.put("error", "Forbidden");
            errorBody.put("message", e.getMessage());
            errorBody.put("path", request.getRequestURI());
            return new ResponseEntity<>(errorBody, HttpStatus.FORBIDDEN);
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("timestamp", LocalDateTime.now().toString());
            errorBody.put("status", HttpStatus.BAD_REQUEST.value());
            errorBody.put("error", "Bad Request");
            errorBody.put("message", e.getMessage());
            errorBody.put("path", request.getRequestURI());
            return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
        }
    }
}