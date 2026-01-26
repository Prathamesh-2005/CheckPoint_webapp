package com.CheckPoint.CheckPoint.Backend.DTO;

import jakarta.validation.constraints.NotNull;

public class UpdateBookingStatusRequest {

    @NotNull(message = "Status cannot be null")
    private String status; // Status should be a String (e.g., "ACCEPTED", "REJECTED")

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}