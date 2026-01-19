package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.RideLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideLocationRepository extends JpaRepository<RideLocation, UUID> {

    @Query("SELECT rl FROM RideLocation rl WHERE rl.ride.id = :rideId AND rl.user.id = :userId ORDER BY rl.timestamp DESC LIMIT 1")
    Optional<RideLocation> findLatestByRideIdAndUserId(@Param("rideId") UUID rideId, @Param("userId") UUID userId);

    @Query("SELECT rl FROM RideLocation rl WHERE rl.ride.id = :rideId ORDER BY rl.timestamp DESC LIMIT 1")
    Optional<RideLocation> findLatestByRideId(@Param("rideId") UUID rideId);
}
