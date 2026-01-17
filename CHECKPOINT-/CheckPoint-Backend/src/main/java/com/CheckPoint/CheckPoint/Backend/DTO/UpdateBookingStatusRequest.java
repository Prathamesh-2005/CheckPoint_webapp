package com.CheckPoint.CheckPoint.Backend.DTO;

import com.CheckPoint.CheckPoint.Backend.Model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateBookingStatusRequest {

    @NotNull(message = "Status cannot be null")
    private BookingStatus status;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}