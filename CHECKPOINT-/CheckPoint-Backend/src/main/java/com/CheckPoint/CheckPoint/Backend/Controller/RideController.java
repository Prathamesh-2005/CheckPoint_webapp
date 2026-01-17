package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.CreateRideRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.RideResponse;
import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Service.RideService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rides")
@CrossOrigin("http://127.0.0.1:5500/")
@Validated
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping
    public ResponseEntity<RideResponse> offerRide(
            @Valid @RequestBody CreateRideRequest request,
            @AuthenticationPrincipal User driver
    ) {
        Ride newRide = rideService.createRide(request, driver);
        return new ResponseEntity<>(new RideResponse(newRide), HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RideResponse>> searchRides(
            @RequestParam double startLat,
            @RequestParam double startLng,
            @RequestParam(defaultValue = "5.0") double radius
    ) {
        List<RideResponse> rides = rideService.searchRides(startLat, startLng, radius);
        return ResponseEntity.ok(rides);
    }

}
