package com.example.inventoryservice.Dto;

import com.example.inventoryservice.Entities.Discount;
import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class DiscountDto {
    private Long id;
    private double discountPercentage;
    private String productId;
}
