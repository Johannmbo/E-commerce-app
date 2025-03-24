package com.example.customerservice.Repository;

import com.example.customerservice.Entities.customer;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CustomerRepository extends JpaRepository<customer, Long> {

}
