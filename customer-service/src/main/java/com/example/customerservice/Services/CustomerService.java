package com.example.customerservice.Services;

import com.example.customerservice.Dto.CustomerDto;
import com.example.customerservice.Entities.customer;
import com.example.customerservice.Repository.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository)
    {this.customerRepository = customerRepository;}

    @Transactional
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

    public Optional<customer> findCustomerById(long id){
        return customerRepository.findById(id);
    }
}
