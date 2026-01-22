package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import com.CheckPoint.CheckPoint.Backend.Model.RideStatus;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RideRepository extends JpaRepository<Ride, UUID> {
    @Query(value = "SELECT * FROM rides r WHERE r.status = 'REQUESTED' AND r.departure_time > :currentTime AND " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(r.start_latitude)) * " +
            "cos(radians(r.start_longitude) - radians(:lon)) + sin(radians(:lat)) * " +
            "sin(radians(r.start_latitude)))) < :radius",
            nativeQuery = true)
    List<Ride> findAvailableRidesNearby(@Param("lat") double lat,
                                        @Param("lon") double lon,
                                        @Param("radius") double radius,
                                        @Param("currentTime") LocalDateTime currentTime);

    List<Ride> findByDriverOrderByCreatedAtDesc(User driver);

    List<Ride> findByDriverAndStatusOrderByCreatedAtDesc(User driver, RideStatus status);

    List<Ride> findByStatusOrderByDepartureTimeAsc(RideStatus status);
}
