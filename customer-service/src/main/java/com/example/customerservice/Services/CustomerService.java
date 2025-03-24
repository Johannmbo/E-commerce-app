package com.example.customerservice.Services;

import com.example.customerservice.Dto.CustomerDto;
import com.example.customerservice.Entities.customer;
import com.example.customerservice.Repository.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository)
    {this.customerRepository = customerRepository;}

    public customer create(CustomerDto customerDto){
        return customerRepository.save(customer.builder()
                    .id(customerDto.getId())
                    .name(customerDto.getName())
                    .Email(customerDto.getEmail())
                    .address(customerDto.getAddress())
                    .build()
        );
    }

    public List<customer> readAll(){
        return customerRepository.findAll();
    }

    public customer update(customer customer)
    {
        return customerRepository.save(customer);
    }

    public void delete(Long id){
        customerRepository.deleteById(id);
    }

    public void findCustomerById(long id){
        customerRepository.findById(id);
    }
}
