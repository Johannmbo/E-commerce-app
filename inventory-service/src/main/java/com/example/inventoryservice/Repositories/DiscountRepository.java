package com.example.inventoryservice.Repositories;

import com.example.inventoryservice.Entities.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
}
