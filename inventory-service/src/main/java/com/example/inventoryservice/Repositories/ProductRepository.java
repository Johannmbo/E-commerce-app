package com.example.inventoryservice.Repositories;

import com.example.inventoryservice.Entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.discount WHERE p.id = :id")
    Optional<Product> findByIdWithDiscount(@Param("id") Long id);


}
