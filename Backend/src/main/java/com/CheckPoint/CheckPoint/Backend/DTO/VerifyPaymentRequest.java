package com.CheckPoint.CheckPoint.Backend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class VerifyPaymentRequest {
    @NotNull
    private UUID rideId;

    @NotBlank
    private String razorpayOrderId;

    @NotBlank
    private String razorpayPaymentId;

    @NotBlank
    private String razorpaySignature;

    @NotBlank
    private String paymentMethod;

    public @NotNull UUID getRideId() {
        return rideId;
    }

    public void setRideId(@NotNull UUID rideId) {
        this.rideId = rideId;
    }

    public @NotBlank String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(@NotBlank String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public @NotBlank String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(@NotBlank String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public @NotBlank String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(@NotBlank String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }

    public @NotBlank String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(@NotBlank String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}