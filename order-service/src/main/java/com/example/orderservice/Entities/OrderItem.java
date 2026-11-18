package com.example.orderservice.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@AllArgsConstructor @NoArgsConstructor
@Builder
@Table(name = "orderItems")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int quantity;

    // On expose la commande, mais pas sa liste de lignes (sinon récursion JSON infinie)
    @ManyToOne
    @JsonIgnoreProperties(value = {"orderItem"}, allowSetters = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Orders order;

}
