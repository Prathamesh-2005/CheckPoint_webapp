package com.CheckPoint.CheckPoint.Backend.Controller;

import com.CheckPoint.CheckPoint.Backend.DTO.CreatePaymentRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.VerifyPaymentRequest;
import com.CheckPoint.CheckPoint.Backend.DTO.TransactionResponse;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import com.CheckPoint.CheckPoint.Backend.Service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins =
        {
                "http://127.0.0.1:5500/","http://localhost:5173/"
        })
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, String>> createPaymentOrder(
            @Valid @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal User rider) {
        Map<String, String> orderDetails = paymentService.createRazorpayOrder(request.getRideId(), rider);
        return ResponseEntity.ok(orderDetails);
    }

    @PostMapping("/verify")
    public ResponseEntity<TransactionResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            @AuthenticationPrincipal User rider) {
        TransactionResponse transaction = paymentService.verifyAndCompletePayment(request, rider);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @PathVariable UUID transactionId,
            @AuthenticationPrincipal User user) {
        TransactionResponse transaction = paymentService.getTransactionById(transactionId, user);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(
            @AuthenticationPrincipal User user) {
        List<TransactionResponse> transactions = paymentService.getUserTransactions(user);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/earnings/pending")
    public ResponseEntity<Map<String, Double>> getPendingEarnings(
            @AuthenticationPrincipal User driver) {
        Double pendingEarnings = paymentService.getDriverPendingEarnings(driver);
        return ResponseEntity.ok(Map.of("pendingEarnings", pendingEarnings));
    }
}
