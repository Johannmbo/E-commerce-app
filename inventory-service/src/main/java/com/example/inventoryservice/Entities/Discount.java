package com.example.inventoryservice.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "discount")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private double discountPercent;

    @OneToOne(mappedBy = "discount")   // Указывает, что связь
    private Product product;
}
