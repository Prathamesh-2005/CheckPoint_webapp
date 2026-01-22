package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Override
    boolean existsById(UUID uuid);

    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.email = :email")
    void updateLastLoginByEmail(@Param("email") String email, @Param("lastLogin") LocalDateTime lastLogin);
}
