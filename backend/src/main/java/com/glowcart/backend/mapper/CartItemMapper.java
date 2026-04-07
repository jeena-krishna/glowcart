package com.glowcart.backend.mapper;

import com.glowcart.backend.dto.response.CartItemResponse;
import com.glowcart.backend.dto.response.CartResponse;
import com.glowcart.backend.entity.CartItem;
import com.glowcart.backend.entity.Product;

import java.math.BigDecimal;
import java.util.List;

public class CartItemMapper {

    private CartItemMapper() {
    }

    public static CartItemResponse toResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal subtotal = product.getPrice()
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productBrand(product.getBrand())
                .productImageUrl(product.getImageUrl())
                .productPrice(product.getPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .inStock(product.getStockQuantity() != null && product.getStockQuantity() > 0)
                .build();
    }

    public static CartResponse toCartResponse(List<CartItem> cartItems) {
        List<CartItemResponse> items = cartItems.stream()
                .map(CartItemMapper::toResponse)
                .toList();

        BigDecimal totalPrice = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(items)
                .totalItems(items.size())
                .totalPrice(totalPrice)
                .build();
    }
}