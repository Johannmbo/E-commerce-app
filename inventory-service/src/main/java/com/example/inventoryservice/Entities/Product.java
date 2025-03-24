package com.example.inventoryservice.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor @NoArgsConstructor
@Data
@Builder
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private String name;
    private String description;
    private String quality;
    private int price;

    @OneToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "discount_id", referencedColumnName = "id") // Внешний ключ
    private Discount discount;

}
