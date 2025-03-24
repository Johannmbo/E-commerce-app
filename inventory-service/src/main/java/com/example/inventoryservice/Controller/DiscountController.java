package com.example.inventoryservice.Controller;


import com.example.inventoryservice.Dto.DiscountDto;
import com.example.inventoryservice.Entities.Discount;
import com.example.inventoryservice.Services.DiscountService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory-service")
@AllArgsConstructor
public class DiscountController {
    private DiscountService discountService;

    @PostMapping("/addDiscount")
    public ResponseEntity<Discount> create(@RequestBody DiscountDto dto) {
        return new ResponseEntity<>(discountService.create(dto), HttpStatus.OK);
    }

    @GetMapping("/listDiscounts")
    public ResponseEntity<List<Discount>> readAll() {
        return new ResponseEntity<>(discountService.readAll(), HttpStatus.OK);
    }

    @PutMapping("/updateDiscount")
    public ResponseEntity<Discount> update(@RequestBody Discount discount) {
        return new ResponseEntity<>(discountService.update(discount), HttpStatus.OK);
    }

    @DeleteMapping("/deleteDiscount/{id}")
    public ResponseEntity<Discount> delete(@PathVariable Long id) {
        discountService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
