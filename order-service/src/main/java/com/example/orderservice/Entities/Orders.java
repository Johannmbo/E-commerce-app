package com.example.orderservice.Entities;


import com.example.orderservice.models.Customer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    @OneToMany(mappedBy = "order")
    private List<OrderItem> orderItem;
    @Transient
    private Customer customer;
}
