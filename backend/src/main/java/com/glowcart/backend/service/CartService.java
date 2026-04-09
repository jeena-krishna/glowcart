package com.glowcart.backend.service;

import com.glowcart.backend.dto.request.CartItemRequest;
import com.glowcart.backend.dto.response.CartResponse;
import com.glowcart.backend.entity.CartItem;
import com.glowcart.backend.entity.Product;
import com.glowcart.backend.entity.User;
import com.glowcart.backend.exception.OutOfStockException;
import com.glowcart.backend.exception.ResourceNotFoundException;
import com.glowcart.backend.mapper.CartItemMapper;
import com.glowcart.backend.repository.CartItemRepository;
import com.glowcart.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        log.debug("Fetching cart for user: {}", userId);
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        return CartItemMapper.toCartResponse(cartItems);
    }

    @Transactional
    public CartResponse addToCart(User user, CartItemRequest request) {
        log.info("User {} adding product {} to cart, quantity: {}",
                user.getId(), request.getProductId(), request.getQuantity());

        // 1. Find the product or throw 404
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product", "id", request.getProductId()));

        // 2. Check if product is in stock
        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new OutOfStockException(
                    "Product '" + product.getName() + "' is currently out of stock");
        }

        // 3. Check if this product is already in the user's cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByUserIdAndProductId(user.getId(), product.getId());

        if (existingItem.isPresent()) {
            // 4a. Product already in cart — update quantity
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();

            // Validate against available stock
            validateStockQuantity(product, newQuantity);

            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
            log.info("Updated cart item quantity to {} for product {}",
                    newQuantity, product.getId());
        } else {
            // 4b. New product — validate stock and create cart item
            validateStockQuantity(product, request.getQuantity());

            CartItem cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
            log.info("Added new product {} to cart for user {}",
                    product.getId(), user.getId());
        }

        // 5. Return the updated cart
        return getCart(user.getId());
    }

    @Transactional
    public CartResponse updateCartItem(User user, Long productId, Integer quantity) {
        log.info("User {} updating product {} quantity to {}",
                user.getId(), productId, quantity);

        // 1. Find the cart item
        CartItem cartItem = cartItemRepository
                .findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item", "productId", productId));

        // 2. If quantity is 0 or less, remove the item
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            log.info("Removed product {} from cart for user {}",
                    productId, user.getId());
            return getCart(user.getId());
        }

        // 3. Validate against available stock
        validateStockQuantity(cartItem.getProduct(), quantity);

        // 4. Update quantity
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return getCart(user.getId());
    }

    @Transactional
    public CartResponse removeFromCart(User user, Long productId) {
        log.info("User {} removing product {} from cart",
                user.getId(), productId);

        CartItem cartItem = cartItemRepository
                .findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item", "productId", productId));

        cartItemRepository.delete(cartItem);
        return getCart(user.getId());
    }

    @Transactional
    public void clearCart(Long userId) {
        log.info("Clearing cart for user: {}", userId);
        cartItemRepository.deleteByUserId(userId);
    }

    public int getCartItemCount(Long userId) {
        return cartItemRepository.countByUserId(userId);
    }

    private void validateStockQuantity(Product product, int requestedQuantity) {
        if (product.getStockQuantity() == null
                || requestedQuantity > product.getStockQuantity()) {
            throw new OutOfStockException(
                    String.format("Only %d units of '%s' available in stock",
                            product.getStockQuantity() != null ? product.getStockQuantity() : 0,
                            product.getName()));
        }
    }
}