package com.glowcart.backend.entity;

public enum OrderStatus {
    PENDING,
    PAYMENT_PROCESSING,
    PAID,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}