package com.example.billingservice.Entities;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data @Builder
@Table(name = "productItems")
public class ProductItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private int price;
    private int quantity;
    private String productName;

    // On expose la facture, mais pas sa liste de lignes (sinon récursion JSON infinie)
    @ManyToOne
    @JsonIgnoreProperties(value = {"productItems"}, allowSetters = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Bill bill;
}
