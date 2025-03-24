package com.example.inventoryservice.Services;

import com.example.inventoryservice.Dto.ProductDto;
import com.example.inventoryservice.Entities.Product;
import com.example.inventoryservice.Repositories.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;


    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;

    }
    public Product create(ProductDto productDto) {
        return productRepository.save(Product.builder()
                .id(productDto.getId())
                .productId(productDto.getProductId())
                .name(productDto.getName())
                .price(productDto.getPrice())
                .description(productDto.getDescription())
                .quality(productDto.getQuality())
                .build()
        );
    }

    public List<Product> readAll(){return productRepository.findAll();}

    public Product update(Product product){return productRepository.save(product);}

    public void delete(Long id){productRepository.deleteById(id);}

    public void deleteAll() {
        productRepository.deleteAll();
    }

}
