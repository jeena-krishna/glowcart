package com.glowcart.backend.service;

import com.glowcart.backend.dto.request.CheckoutRequest;
import com.glowcart.backend.dto.response.OrderResponse;
import com.glowcart.backend.entity.*;
import com.glowcart.backend.exception.OutOfStockException;
import com.glowcart.backend.exception.ResourceNotFoundException;
import com.glowcart.backend.mapper.OrderMapper;
import com.glowcart.backend.repository.CartItemRepository;
import com.glowcart.backend.repository.OrderRepository;
import com.glowcart.backend.repository.ProductRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Map<String, Object> checkout(User user, CheckoutRequest request) {
        log.info("Processing checkout for user: {}", user.getId());

        // 1. Get the user's cart
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart");
        }

        // 2. Validate stock for every item
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() == null
                    || cartItem.getQuantity() > product.getStockQuantity()) {
                throw new OutOfStockException(
                        String.format("Insufficient stock for '%s'. Available: %d, Requested: %d",
                                product.getName(),
                                product.getStockQuantity() != null ? product.getStockQuantity() : 0,
                                cartItem.getQuantity()));
            }
        }

        // 3. Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .productName(product.getName())
                    .productBrand(product.getBrand())
                    .build();
            orderItems.add(orderItem);
        }

        // 4. Create the order
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        log.info("Created order {} with total ${}", savedOrder.getId(), totalAmount);

        // 5. Create Stripe PaymentIntent
        try {
            long amountInCents = totalAmount
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .setDescription("GlowCart Order #" + savedOrder.getId())
                    .putMetadata("orderId", String.valueOf(savedOrder.getId()))
                    .putMetadata("userId", String.valueOf(user.getId()))
                    .addPaymentMethodType("card")
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // 6. Update order with Stripe payment intent ID
            savedOrder.setStripePaymentIntentId(paymentIntent.getId());
            savedOrder.setStatus(OrderStatus.PAYMENT_PROCESSING);
            orderRepository.save(savedOrder);

            log.info("Stripe PaymentIntent created: {} for order {}",
                    paymentIntent.getId(), savedOrder.getId());

            // 7. Return client secret and order info
            return Map.of(
                    "clientSecret", paymentIntent.getClientSecret(),
                    "orderId", savedOrder.getId(),
                    "totalAmount", totalAmount
            );

        } catch (StripeException e) {
            log.error("Stripe error during checkout: {}", e.getMessage());
            savedOrder.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(savedOrder);
            throw new RuntimeException("Payment processing failed. Please try again.");
        }
    }

    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        log.info("Confirming order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // 1. Update order status to PAID
        order.setStatus(OrderStatus.PAID);

        // 2. Decrement stock for each product
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            int newStock = product.getStockQuantity() - item.getQuantity();
            product.setStockQuantity(Math.max(newStock, 0));
            productRepository.save(product);
        }

        // 3. Clear the user's cart
        cartItemRepository.deleteByUserId(order.getUser().getId());

        Order savedOrder = orderRepository.save(order);
        log.info("Order {} confirmed and paid", orderId);

        return OrderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        log.debug("Fetching orders for user: {}", userId);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        log.debug("Fetching order {} for user {}", orderId, userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", "id", orderId);
        }

        return OrderMapper.toResponse(order);
    }

    @Transactional
    public void handleStripeWebhook(String paymentIntentId, String status) {
        log.info("Stripe webhook received: paymentIntent={}, status={}",
                paymentIntentId, status);

        Order order = orderRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElse(null);

        if (order == null) {
            log.warn("No order found for PaymentIntent: {}", paymentIntentId);
            return;
        }

        switch (status) {
            case "succeeded" -> confirmOrder(order.getId());
            case "payment_failed" -> {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                log.warn("Payment failed for order: {}", order.getId());
            }
            default -> log.info("Unhandled payment status: {} for order: {}",
                    status, order.getId());
        }
    }
}