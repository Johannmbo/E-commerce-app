package com.example.customerservice.Dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class CustomerDto {
    private Long id;
    private String name;
    private String Email;
    private String address;
}
