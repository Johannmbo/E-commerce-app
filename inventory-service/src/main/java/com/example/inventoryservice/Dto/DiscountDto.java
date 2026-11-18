package com.example.inventoryservice.Dto;


import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class DiscountDto {
    private Long id;
    private int discountPercentage;
    private String productId;
}
