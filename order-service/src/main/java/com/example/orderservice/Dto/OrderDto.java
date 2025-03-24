package com.example.orderservice.Dto;

import com.example.orderservice.Entities.OrderItem;
import lombok.Builder;
import lombok.Data;


import java.util.Date;
import java.util.List;

@Data
@Builder
public class OrderDto {
    private Long id;
    private Date orderDate;
    private String orderStatus;
    private String orderType;
    private List<OrderItem> orderItem;
}
