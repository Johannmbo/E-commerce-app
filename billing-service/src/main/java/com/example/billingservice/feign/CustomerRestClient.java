package com.example.billingservice.feign;

import com.example.customerservice.Entities.customer;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.web.PagedModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customer-service")
public interface CustomerRestClient {
    @GetMapping("/customer-service/{id}")
    customer findCustomerById(@PathVariable Long id);

    @GetMapping("/customer-service/listCustomers")
    PagedModel<customer> getAllCustomers();
}
