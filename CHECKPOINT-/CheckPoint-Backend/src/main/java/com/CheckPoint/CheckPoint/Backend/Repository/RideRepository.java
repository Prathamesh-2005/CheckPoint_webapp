package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.Ride;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RideRepository extends CrudRepository<Ride, UUID> {
    @Query(value = "SELECT * FROM rides WHERE status = 'REQUESTED' AND departure_time > :currentTime AND " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(start_latitude)) * " +
            "cos(radians(start_longitude) - radians(:lon)) + sin(radians(:lat)) * " +
            "sin(radians(start_latitude)))) < :radius",
            nativeQuery = true)
    List<Ride> findAvailableRidesNearby(@Param("lat") double lat,
                                        @Param("lon") double lon,
                                        @Param("radius") double radius,
                                        @Param("currentTime") LocalDateTime currentTime);
}
