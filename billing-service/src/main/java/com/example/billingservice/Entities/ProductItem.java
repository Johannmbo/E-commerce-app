package com.example.billingservice.Entities;

import com.example.billingservice.models.Product;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data @Builder
public class ProductItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productId;
    private int price;
    private int quantity;
    private String productName;

    @ManyToOne
    private Bill bill;
    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Product product;
}
