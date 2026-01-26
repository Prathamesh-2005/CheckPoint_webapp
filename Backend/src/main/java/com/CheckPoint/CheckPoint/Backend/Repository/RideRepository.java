package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface RideRepository extends JpaRepository<Ride, UUID> {
    List<Ride> findByDriverOrderByCreatedAtDesc(User driver);

    List<Ride> findByDriverAndStatusOrderByCreatedAtDesc(User driver, RideStatus status);

    @Query("""
                SELECT r FROM Ride r
                WHERE r.status = 'AVAILABLE'
                AND r.departureTime > :currentTime
                AND r.availableSeats > 0
                AND (
                    (6371 * acos(
                        cos(radians(:destLat)) * cos(radians(r.endLatitude)) *
                        cos(radians(r.endLongitude) - radians(:destLng)) +
                        sin(radians(:destLat)) * sin(radians(r.endLatitude))
                    )) <= :destRadius
                    AND
                    (6371 * acos(
                        cos(radians(:startLat)) * cos(radians(r.startLatitude)) *
                        cos(radians(r.startLongitude) - radians(:startLng)) +
                        sin(radians(:startLat)) * sin(radians(r.startLatitude))
                    )) <= :startRadius
                )
                ORDER BY r.departureTime ASC
            """)
    List<Ride> findAvailableRidesNearby(
            @Param("startLat") double startLat,
            @Param("startLng") double startLng,
            @Param("startRadius") double startRadius,
            @Param("destLat") double destLat,
            @Param("destLng") double destLng,
            @Param("destRadius") double destRadius,
            @Param("currentTime") LocalDateTime currentTime);
}
