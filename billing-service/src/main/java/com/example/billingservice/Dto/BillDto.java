package com.example.billingservice.Dto;

import com.example.billingservice.Entities.ProductItem;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class BillDto {
    private Long id;
    private Date billingDate;
    private long customerId;
    private ProductItemDto productItem;
}
