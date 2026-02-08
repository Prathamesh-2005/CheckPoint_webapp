package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.CreateRideRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.RideResponse;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Service.RideService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rides") 
@CrossOrigin(origins = { "http://127.0.0.1:5500/", "http://localhost:5173" })
@Validated
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping
    public ResponseEntity<RideResponse> offerRide(
            @Valid @RequestBody CreateRideRequest request,
            @AuthenticationPrincipal User driver) {
        RideResponse response = rideService.createRideWithResponse(request, driver);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/search") 
    public ResponseEntity<List<RideResponse>> searchRides(
            @RequestParam double startLat,
            @RequestParam double startLng,
            @RequestParam double destLat,
            @RequestParam double destLng,
            @RequestParam(defaultValue = "5.0") double radius) {
        List<RideResponse> rides = rideService.searchRides(
                startLat, startLng,
                destLat, destLng,
                radius);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<RideResponse> getRideById(@PathVariable UUID rideId) {
        RideResponse ride = rideService.getRideById(rideId);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<RideResponse>> getMyRides(
            @AuthenticationPrincipal User driver,
            @RequestParam(required = false) RideStatus status) {
        List<RideResponse> rides;
        if (status != null) {
            rides = rideService.getDriverRidesByStatus(driver, status);
        } else {
            rides = rideService.getDriverRides(driver);
        }
        return ResponseEntity.ok(rides);
    }

    @PatchMapping("/{rideId}/cancel")
    public ResponseEntity<RideResponse> cancelRide(
            @PathVariable UUID rideId,
            @AuthenticationPrincipal User driver) {
        RideResponse ride = rideService.cancelRide(rideId, driver);
        return ResponseEntity.ok(ride);
    }

    @PatchMapping("/{rideId}/start")
    public ResponseEntity<RideResponse> startRide(
            @PathVariable UUID rideId,
            @AuthenticationPrincipal User driver) {
        RideResponse ride = rideService.startRide(rideId, driver);
        return ResponseEntity.ok(ride);
    }

    @PatchMapping("/{rideId}/complete")
    public ResponseEntity<RideResponse> completeRide(
            @PathVariable UUID rideId,
            @AuthenticationPrincipal User driver) {
        RideResponse ride = rideService.completeRide(rideId, driver);
        return ResponseEntity.ok(ride);
    }
}
