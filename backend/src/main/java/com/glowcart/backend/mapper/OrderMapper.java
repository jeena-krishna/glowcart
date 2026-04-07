package com.glowcart.backend.mapper;

import com.glowcart.backend.dto.response.OrderItemResponse;
import com.glowcart.backend.dto.response.OrderResponse;
import com.glowcart.backend.entity.Order;
import com.glowcart.backend.entity.OrderItem;

import java.math.BigDecimal;
import java.util.List;

public class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(OrderMapper::toOrderItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    public static OrderItemResponse toOrderItemResponse(OrderItem item) {
        BigDecimal subtotal = item.getPriceAtPurchase()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productBrand(item.getProductBrand())
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .subtotal(subtotal)
                .build();
    }
}