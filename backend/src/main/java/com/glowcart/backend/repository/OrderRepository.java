package com.glowcart.backend.repository;

import com.glowcart.backend.entity.Order;
import com.glowcart.backend.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}