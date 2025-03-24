package com.example.billingservice.Controller;

import com.example.billingservice.Dto.ProductItemDto;
import com.example.billingservice.Entities.Bill;
import com.example.billingservice.Entities.ProductItem;
import com.example.billingservice.Services.ProductItemService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/billing-service")
@AllArgsConstructor
public class ProductItemController {
    private ProductItemService productItemService;

    @PostMapping("/addProductItem")
    public ResponseEntity<ProductItem> create (@RequestBody ProductItemDto dto) {
        return new ResponseEntity<>(productItemService.create(dto), HttpStatus.OK);
    }

    @GetMapping("/listProductItems")
    public ResponseEntity<List<ProductItem>>readAll(){
        return new ResponseEntity<>(productItemService.readAll(), HttpStatus.OK);
    }

    @PutMapping("/updateProductItem")
    public ResponseEntity<ProductItem> update(@RequestBody ProductItem productItem){
        return new ResponseEntity<>(productItemService.update(productItem), HttpStatus.OK);
    }

    @DeleteMapping("/deleteProductItem/{id}")
    public ResponseEntity<Bill> delete(@PathVariable Long id){
        productItemService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
