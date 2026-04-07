package com.glowcart.backend.repository;

import com.glowcart.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByProductType(String productType, Pageable pageable);

    Page<Product> findByBrand(String brand, Pageable pageable);

    Page<Product> findByCategory(String category, Pageable pageable);

    Page<Product> findByFeaturedTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE "
         + "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
         + "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
         + "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
         + "LOWER(p.productType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> search(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL ORDER BY p.brand")
    List<String> findAllBrands();

    @Query("SELECT DISTINCT p.productType FROM Product p WHERE p.productType IS NOT NULL ORDER BY p.productType")
    List<String> findAllProductTypes();

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findAllCategories();
}