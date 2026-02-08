package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.UpdateVehicleDetailsRequest;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Model.VehicleDetails;
import com.CheckPoint.CheckPoint.Backend.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = { "http://127.0.0.1:5500/", "http://localhost:5173" })
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        User userProfile = userService.getUserProfile(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("id", userProfile.getId());
        response.put("email", userProfile.getEmail());
        response.put("firstName", userProfile.getFirstName());
        response.put("lastName", userProfile.getLastName());
        response.put("profileImageUrl", userProfile.getProfileImageUrl());
        response.put("vehicleDetails", userProfile.getVehicleDetails());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/vehicle")
    public ResponseEntity<?> updateVehicleDetails(
            @Valid @RequestBody UpdateVehicleDetailsRequest request,
            @AuthenticationPrincipal User user) {

        VehicleDetails vehicleDetails = new VehicleDetails();
        vehicleDetails.setVehicleModel(request.getVehicleModel());
        vehicleDetails.setVehicleNumber(request.getVehicleNumber());
        vehicleDetails.setVehicleColor(request.getVehicleColor());
        vehicleDetails.setIsVerified(false);

        User updatedUser = userService.updateVehicleDetails(user.getId(), vehicleDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vehicle details updated successfully");
        response.put("vehicleDetails", updatedUser.getVehicleDetails());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vehicle")
    public ResponseEntity<?> getVehicleDetails(@AuthenticationPrincipal User user) {
        User userProfile = userService.getUserProfile(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("vehicleDetails", userProfile.getVehicleDetails());

        return ResponseEntity.ok(response);
    }
}
