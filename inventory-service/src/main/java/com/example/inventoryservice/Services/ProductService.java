package com.example.inventoryservice.Services;

import com.example.inventoryservice.Dto.ProductDto;
import com.example.inventoryservice.Entities.Discount;
import com.example.inventoryservice.Entities.Product;
import com.example.inventoryservice.Repositories.DiscountRepository;
import com.example.inventoryservice.Repositories.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final DiscountRepository discountRepository;

    public ProductService(ProductRepository productRepository, DiscountRepository discountRepository) {
        this.productRepository = productRepository;
        this.discountRepository = discountRepository;
    }

    @Transactional
    public Product create(ProductDto productDto) {
        return productRepository.save(Product.builder()
                .id(productDto.getId())
                .productId(productDto.getProductId())
                .name(productDto.getName())
                .price(productDto.getPrice())
                .description(productDto.getDescription())
                .quality(productDto.getQuality())
                .discount(discountFor(productDto.getProductId()))
                .build()
        );
    }

    public List<Product> readAll(){return productRepository.findAll();}

    // La remise d'un produit est toujours celle qui porte la même référence (productId)
    public Product update(Product product){
        product.setDiscount(discountFor(product.getProductId()));
        return productRepository.save(product);
    }

    public void delete(Long id){productRepository.deleteById(id);}

    public void deleteAll() {
        productRepository.deleteAll();
    }

    private Discount discountFor(String productId) {
        if (productId == null) return null;
        return discountRepository.findFirstByProductIdOrderByIdDesc(productId).orElse(null);
    }

}
