package com.glowcart.backend.service;

import com.glowcart.backend.dto.response.ProductResponse;
import com.glowcart.backend.entity.Product;
import com.glowcart.backend.entity.User;
import com.glowcart.backend.entity.WishlistItem;
import com.glowcart.backend.exception.ResourceNotFoundException;
import com.glowcart.backend.mapper.ProductMapper;
import com.glowcart.backend.repository.ProductRepository;
import com.glowcart.backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private static final Logger log = LoggerFactory.getLogger(WishlistService.class);

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getWishlist(Long userId) {
        log.debug("Fetching wishlist for user: {}", userId);
        List<WishlistItem> items = wishlistItemRepository.findByUserId(userId);

        return items.stream()
                .map(item -> ProductMapper.toResponse(item.getProduct(), true))
                .toList();
    }

    @Transactional
    public boolean toggleWishlist(User user, Long productId) {
        log.info("User {} toggling wishlist for product {}", user.getId(), productId);

        // 1. Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product", "id", productId));

        // 2. Check if already wishlisted
        var existing = wishlistItemRepository
                .findByUserIdAndProductId(user.getId(), productId);

        if (existing.isPresent()) {
            // 3a. Already wishlisted — remove it
            wishlistItemRepository.delete(existing.get());
            log.info("Removed product {} from wishlist for user {}",
                    productId, user.getId());
            return false; // false = removed from wishlist
        } else {
            // 3b. Not wishlisted — add it
            WishlistItem item = WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistItemRepository.save(item);
            log.info("Added product {} to wishlist for user {}",
                    productId, user.getId());
            return true; // true = added to wishlist
        }
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(Long userId, Long productId) {
        return wishlistItemRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        log.info("User {} removing product {} from wishlist",
                user.getId(), productId);

        WishlistItem item = wishlistItemRepository
                .findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Wishlist item", "productId", productId));

        wishlistItemRepository.delete(item);
    }
}