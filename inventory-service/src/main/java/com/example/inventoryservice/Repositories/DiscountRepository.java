package com.example.inventoryservice.Repositories;

import com.example.inventoryservice.Entities.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
    Optional<Discount> findFirstByProductIdOrderByIdDesc(String productId);
}
