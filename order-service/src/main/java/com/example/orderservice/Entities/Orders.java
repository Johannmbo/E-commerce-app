package com.example.orderservice.Entities;


import com.example.orderservice.models.Customer;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Date;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
@Table(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date orderDate;
    private String orderStatus;
    private String orderType;
    // Supprimer une commande supprime ses lignes ; en JSON, les lignes n'incluent pas la commande
    @OneToMany(mappedBy = "order", cascade = CascadeType.REMOVE)
    @JsonIgnoreProperties(value = {"order"}, allowSetters = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<OrderItem> orderItem;
    @Transient
    private Customer customer;
}
