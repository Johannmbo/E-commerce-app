package com.example.billingservice.Dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductItemDto {
    private Long id;
    private String productId;
    private int price;
    private int quantity;
    private String productName;
    private BillDto bill;
}
