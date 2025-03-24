package com.example.billingservice.feign;

import com.example.inventoryservice.Entities.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.web.PagedModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service")
public interface ProductRestClient {
    @GetMapping("/api/products/{id}")
    Product findProductById(@PathVariable Long id);

    @GetMapping("/api/products")
    PagedModel<Product> getAllProdcuts();
}
