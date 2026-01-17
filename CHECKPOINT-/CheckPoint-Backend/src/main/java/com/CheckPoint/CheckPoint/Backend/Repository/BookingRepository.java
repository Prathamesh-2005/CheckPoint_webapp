package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.Booking;
import com.CheckPoint.CheckPoint.Backend.Model.BookingStatus;
import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByRideIdAndPassengerId(UUID rideId, UUID passengerId);

    List<Booking> findByRideAndStatus(Ride ride, BookingStatus status);
}