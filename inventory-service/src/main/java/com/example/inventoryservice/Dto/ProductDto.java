package com.example.inventoryservice.Dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDto {
    private Long id;
    private String productId;
    private String name;
    private String description;
    private String quality;
    private int price;
    private int percentage;
}
