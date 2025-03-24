package com.example.orderservice.Dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class OrderItemDto {
    private Long id;
    private Long orderId;
    private int quantity;
}
