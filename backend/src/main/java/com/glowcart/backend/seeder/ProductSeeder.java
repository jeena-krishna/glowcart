package com.glowcart.backend.seeder;

import com.glowcart.backend.dto.external.MakeupProductDto;
import com.glowcart.backend.entity.Product;
import com.glowcart.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class ProductSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductSeeder.class);
    private static final String MAKEUP_API_URL = "http://makeup-api.herokuapp.com/api/v1/products.json";

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Products already exist in database. Skipping seed.");
            return;
        }

        log.info("No products found. Starting data seed from Makeup API...");
        seedProducts();
    }

    private void seedProducts() {
        try {
            ResponseEntity<List<MakeupProductDto>> response = restTemplate.exchange(
                    MAKEUP_API_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<MakeupProductDto>>() {}
            );

            List<MakeupProductDto> apiProducts = response.getBody();

            if (apiProducts == null || apiProducts.isEmpty()) {
                log.warn("No products received from Makeup API");
                return;
            }

            log.info("Received {} products from Makeup API", apiProducts.size());

            List<Product> productsToSave = new ArrayList<>();
            int skipped = 0;

            for (MakeupProductDto dto : apiProducts) {
                Product product = mapToEntity(dto);
                if (product != null) {
                    productsToSave.add(product);
                } else {
                    skipped++;
                }
            }

            productRepository.saveAll(productsToSave);
            log.info("Successfully seeded {} products ({} skipped due to missing data)",
                    productsToSave.size(), skipped);

        } catch (Exception e) {
            log.error("Failed to seed products from Makeup API: {}", e.getMessage());
            log.info("Application will continue without seeded data. You can add products manually via the API.");
        }
    }

    private Product mapToEntity(MakeupProductDto dto) {
        // Skip products without a name or valid price
        if (dto.getName() == null || dto.getName().isBlank()) {
            return null;
        }

        BigDecimal price = parsePrice(dto.getPrice());
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        // Clean up the image URL — some start with "//" instead of "https://"
        String imageUrl = dto.getImageLink();
        if (imageUrl != null && imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
        }

        // Clean up description — remove extra whitespace and HTML artifacts
        String description = dto.getDescription();
        if (description != null) {
            description = description.replaceAll("\\s+", " ").trim();
        }

        // Capitalize brand name for consistency
        String brand = dto.getBrand();
        if (brand != null && !brand.isBlank()) {
            brand = brand.substring(0, 1).toUpperCase() + brand.substring(1);
        }

        // Generate realistic stock quantity
        Random random = new Random();
        int stockQuantity = random.nextInt(100) + 10; // 10 to 109

        // Parse rating
        BigDecimal rating = null;
        if (dto.getRating() != null && dto.getRating() > 0) {
            rating = BigDecimal.valueOf(dto.getRating())
                    .setScale(1, RoundingMode.HALF_UP);
        }

        return Product.builder()
                .name(dto.getName().trim())
                .brand(brand)
                .price(price)
                .description(description)
                .productType(dto.getProductType())
                .category(dto.getCategory())
                .imageUrl(imageUrl)
                .productLink(dto.getProductLink())
                .stockQuantity(stockQuantity)
                .featured(rating != null && rating.compareTo(BigDecimal.valueOf(4.5)) >= 0)
                .rating(rating)
                .build();
    }

    private BigDecimal parsePrice(String priceStr) {
        if (priceStr == null || priceStr.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(priceStr.trim())
                    .setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}