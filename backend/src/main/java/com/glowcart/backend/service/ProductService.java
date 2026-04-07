package com.glowcart.backend.service;

import com.glowcart.backend.dto.request.ProductRequest;
import com.glowcart.backend.dto.response.ProductResponse;
import com.glowcart.backend.entity.Product;
import com.glowcart.backend.exception.ResourceNotFoundException;
import com.glowcart.backend.mapper.ProductMapper;
import com.glowcart.backend.repository.ProductRepository;
import com.glowcart.backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final WishlistItemRepository wishlistItemRepository;

    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        log.debug("Fetching all products, page: {}", pageable.getPageNumber());
        return productRepository.findAll(pageable)
                .map(ProductMapper::toResponse);
    }

    public Page<ProductResponse> getAllProducts(Pageable pageable, Long userId) {
        log.debug("Fetching all products for user: {}, page: {}", userId, pageable.getPageNumber());
        return productRepository.findAll(pageable)
                .map(product -> {
                    boolean wishlisted = wishlistItemRepository
                            .existsByUserIdAndProductId(userId, product.getId());
                    return ProductMapper.toResponse(product, wishlisted);
                });
    }

    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product with id: {}", id);
        Product product = findProductOrThrow(id);
        return ProductMapper.toResponse(product);
    }

    public ProductResponse getProductById(Long id, Long userId) {
        log.debug("Fetching product with id: {} for user: {}", id, userId);
        Product product = findProductOrThrow(id);
        boolean wishlisted = wishlistItemRepository
                .existsByUserIdAndProductId(userId, product.getId());
        return ProductMapper.toResponse(product, wishlisted);
    }

    public Page<ProductResponse> getProductsByType(String productType, Pageable pageable) {
        log.debug("Fetching products by type: {}", productType);
        return productRepository.findByProductType(productType, pageable)
                .map(ProductMapper::toResponse);
    }

    public Page<ProductResponse> getProductsByBrand(String brand, Pageable pageable) {
        log.debug("Fetching products by brand: {}", brand);
        return productRepository.findByBrand(brand, pageable)
                .map(ProductMapper::toResponse);
    }

    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        log.debug("Fetching products by category: {}", category);
        return productRepository.findByCategory(category, pageable)
                .map(ProductMapper::toResponse);
    }

    public Page<ProductResponse> getFeaturedProducts(Pageable pageable) {
        log.debug("Fetching featured products");
        return productRepository.findByFeaturedTrue(pageable)
                .map(ProductMapper::toResponse);
    }

    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        log.debug("Searching products with keyword: {}", keyword);
        return productRepository.search(keyword, pageable)
                .map(ProductMapper::toResponse);
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands();
    }

    public List<String> getAllProductTypes() {
        return productRepository.findAllProductTypes();
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creating new product: {}", request.getName());
        Product product = ProductMapper.toEntity(request);
        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("Updating product with id: {}", id);
        Product product = findProductOrThrow(id);
        ProductMapper.updateEntity(product, request);
        Product saved = productRepository.save(product);
        return ProductMapper.toResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product with id: {}", id);
        Product product = findProductOrThrow(id);
        productRepository.delete(product);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }
}