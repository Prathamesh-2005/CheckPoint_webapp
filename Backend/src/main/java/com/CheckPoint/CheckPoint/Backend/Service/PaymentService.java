package com.CheckPoint.CheckPoint.Backend.Service;

import com.CheckPoint.CheckPoint.Backend.DTO.TransactionResponse;
import com.CheckPoint.CheckPoint.Backend.DTO.VerifyPaymentRequest;
import com.CheckPoint.CheckPoint.Backend.Model.*;
import com.CheckPoint.CheckPoint.Backend.Repository.RideRepository;
import com.CheckPoint.CheckPoint.Backend.Repository.TransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostConstruct
    public void debugKeys() {
        System.out.println("KEY ID: " + razorpayKeyId);
        System.out.println("KEY SECRET: " + razorpayKeySecret);
    }


    private final RideRepository rideRepository;
    private final TransactionRepository transactionRepository;
    private final BookingService bookingService;
    private final NotificationService notificationService;

    public PaymentService(RideRepository rideRepository,
            TransactionRepository transactionRepository,
            BookingService bookingService,
            NotificationService notificationService) {
        this.rideRepository = rideRepository;
        this.transactionRepository = transactionRepository;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Map<String, String> createRazorpayOrder(UUID rideId, User rider) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Booking booking = bookingService.getBookingByRideAndPassenger(rideId, rider);
        if (booking == null || !booking.getStatus().equals(BookingStatus.ACCEPTED)) {
            throw new RuntimeException("You don't have an accepted booking for this ride");
        }

        if (ride.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this ride");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            BigDecimal baseAmount = ride.getPrice();
            BigDecimal platformFee = baseAmount.multiply(new BigDecimal("0.10"));
            BigDecimal totalAmount = baseAmount.add(platformFee);

            int amountInPaise = totalAmount.multiply(new BigDecimal("100")).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "ride_" + rideId.toString().substring(0, 20));

            Order order = razorpayClient.orders.create(orderRequest);

            ride.setPlatformFee(platformFee);
            ride.setDriverEarnings(baseAmount);
            rideRepository.save(ride);

            Map<String, String> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", String.valueOf(amountInPaise));
            response.put("currency", "INR");
            response.put("key", razorpayKeyId);
            response.put("rideId", rideId.toString());

            return response;

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }

    @Transactional
    public TransactionResponse verifyAndCompletePayment(VerifyPaymentRequest request, User rider) {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValidSignature) {
                throw new RuntimeException("Invalid payment signature");
            }

            Transaction transaction = new Transaction();
            transaction.setRide(ride);
            transaction.setRider(rider);
            transaction.setDriver(ride.getDriver());
            transaction.setAmount(ride.getPrice().doubleValue());
            transaction.setType(TransactionType.RIDE_PAYMENT);
            transaction.setStatus(PaymentStatus.COMPLETED);
            transaction.setPaymentMethod(request.getPaymentMethod());
            transaction.setPaymentGatewayOrderId(request.getRazorpayOrderId());
            transaction.setPaymentGatewayPaymentId(request.getRazorpayPaymentId());
            transaction.setPaymentGatewaySignature(request.getRazorpaySignature());
            transaction.setCompletedAt(LocalDateTime.now());

            transactionRepository.save(transaction);

            ride.setPaymentStatus(PaymentStatus.COMPLETED);
            ride.setPaymentMethod(request.getPaymentMethod());
            rideRepository.save(ride);
            notificationService.createAndSendNotification(
                    rider,
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Successful",
                    "Your payment of ₹" + ride.getPrice() + " was completed successfully",
                    ride.getId(),
                    null);

            notificationService.createAndSendNotification(
                    ride.getDriver(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "You received ₹" + ride.getDriverEarnings() + " for your ride",
                    ride.getId(),
                    null);

            return new TransactionResponse(transaction);

        } catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    public TransactionResponse getTransactionById(UUID transactionId, User user) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getRider().getId().equals(user.getId()) &&
                !transaction.getDriver().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        return new TransactionResponse(transaction);
    }

    public List<TransactionResponse> getUserTransactions(User user) {
        List<Transaction> transactions = transactionRepository
                .findByRiderOrDriverOrderByCreatedAtDesc(user, user);

        return transactions.stream()
                .map(TransactionResponse::new)
                .collect(Collectors.toList());
    }

    public Double getDriverPendingEarnings(User driver) {
        Double completedEarnings = transactionRepository
                .sumCompletedTransactionsByDriverAndType(driver, TransactionType.RIDE_PAYMENT);

        Double paidOut = transactionRepository
                .sumCompletedTransactionsByDriverAndType(driver, TransactionType.DRIVER_PAYOUT);

        return (completedEarnings != null ? completedEarnings : 0.0) -
                (paidOut != null ? paidOut : 0.0);
    }
}