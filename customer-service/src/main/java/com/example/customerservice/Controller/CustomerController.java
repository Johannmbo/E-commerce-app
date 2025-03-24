package com.example.customerservice.Controller;

import com.example.customerservice.Dto.CustomerDto;
import com.example.customerservice.Entities.customer;
import com.example.customerservice.Services.CustomerService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/customer-service")
@AllArgsConstructor
public class CustomerController {
    private CustomerService customerService;

    @PostMapping("/addCustomer")
    public ResponseEntity<customer> create (@RequestBody CustomerDto dto){
        return new ResponseEntity<>(customerService.create(dto), HttpStatus.OK);
    }

    @GetMapping("/listCustomers")
    public ResponseEntity<List<customer>>readAll(){
        return new ResponseEntity<>(customerService.readAll(), HttpStatus.OK);
    }

    @PutMapping("/updateCustomer")
    public ResponseEntity<customer> update(@RequestBody customer customer){
        return new ResponseEntity<>(customerService.update(customer), HttpStatus.OK);
    }

    @DeleteMapping("/deleteCustomer/{id}")
    public ResponseEntity<customer> delete(@PathVariable Long id){
        customerService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/findCustomer/{id}")
    public ResponseEntity<customer>findCustomerById(@PathVariable Long id){
        customerService.findCustomerById(id);
        return new ResponseEntity<>( HttpStatus.OK);
    }


}
