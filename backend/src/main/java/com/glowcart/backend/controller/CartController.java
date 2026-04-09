package com.glowcart.backend.controller;

import com.glowcart.backend.dto.request.CartItemRequest;
import com.glowcart.backend.dto.response.CartResponse;
import com.glowcart.backend.entity.User;
import com.glowcart.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal User user) {
        CartResponse cart = cartService.getCart(user.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.addToCart(user, request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        CartResponse cart = cartService.updateCartItem(user, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        CartResponse cart = cartService.removeFromCart(user, productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartItemCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCartItemCount(user.getId()));
    }
}