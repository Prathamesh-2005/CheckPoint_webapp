package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.PasswordResetToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser_Id(UUID userId);
    @Transactional
    void deleteByUser_Id(UUID userId);
    boolean existsByToken(String token);
}
