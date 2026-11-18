package com.example.inventoryservice.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@AllArgsConstructor @NoArgsConstructor
@Data
@Builder
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private String name;
    private String description;
    private String quality;
    private int price;

    // Clé étrangère dédiée : "id" est déjà la clé primaire du produit.
    // La remise est rattachée automatiquement via productId (voir ProductService / DiscountService).
    @OneToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "discount_id", referencedColumnName = "id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Discount discount;

}
