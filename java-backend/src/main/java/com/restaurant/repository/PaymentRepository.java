package com.restaurant.repository;

import com.restaurant.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByUserId(String userId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByReservationId(String reservationId);
    List<Payment> findByOrderId(String orderId);
}

