package com.CheckPoint.CheckPoint.Backend.Repository;

import com.CheckPoint.CheckPoint.Backend.Model.Transaction;
import com.CheckPoint.CheckPoint.Backend.Model.TransactionType;
import com.CheckPoint.CheckPoint.Backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByRiderOrDriverOrderByCreatedAtDesc(User rider, User driver);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.driver = :driver AND t.type = :type AND t.status = 'COMPLETED'")
    Double sumCompletedTransactionsByDriverAndType(User driver, TransactionType type);
}
