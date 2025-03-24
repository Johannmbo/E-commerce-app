package com.example.inventoryservice.Controller;


import com.example.inventoryservice.Dto.ProductDto;
import com.example.inventoryservice.Entities.Product;
import com.example.inventoryservice.Services.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path ="/inventory-service")
@AllArgsConstructor
public class ProductController {
    private ProductService productService;

    @PostMapping("/addProduct")
    public ResponseEntity<Product> create (@RequestBody ProductDto dto) {
        return new ResponseEntity<>(productService.create(dto), HttpStatus.OK);
    }

    @GetMapping("/listProducts")
    public ResponseEntity<List<Product>>readAll(){
        return new ResponseEntity<>(productService.readAll(), HttpStatus.OK);
    }

    @PutMapping("/updateProduct")
    public ResponseEntity<Product> update(@RequestBody Product product){
        return new ResponseEntity<>(productService.update(product), HttpStatus.OK);
    }

    @DeleteMapping("/deleteProduct/{id}")
    public ResponseEntity<Product> delete(@PathVariable Long id){
      productService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/deleteAllProducts")
    public ResponseEntity<Void> deleteAll() {
        productService.deleteAll();
        return ResponseEntity.ok().build();
    }
}
