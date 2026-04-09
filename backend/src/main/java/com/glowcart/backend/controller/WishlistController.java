package com.glowcart.backend.controller;

import com.glowcart.backend.dto.response.ProductResponse;
import com.glowcart.backend.entity.User;
import com.glowcart.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getWishlist(
            @AuthenticationPrincipal User user) {
        List<ProductResponse> wishlist = wishlistService.getWishlist(user.getId());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, Boolean>> toggleWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        boolean wishlisted = wishlistService.toggleWishlist(user, productId);
        return ResponseEntity.ok(Map.of("wishlisted", wishlisted));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Map<String, Boolean>> isWishlisted(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        boolean wishlisted = wishlistService.isWishlisted(user.getId(), productId);
        return ResponseEntity.ok(Map.of("wishlisted", wishlisted));
    }
}