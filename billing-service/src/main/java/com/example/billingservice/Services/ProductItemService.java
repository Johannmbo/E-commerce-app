package com.example.billingservice.Services;

import com.example.billingservice.Dto.ProductItemDto;
import com.example.billingservice.Entities.ProductItem;
import com.example.billingservice.Repository.ProductItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ProductItemService {
    private final ProductItemRepository productItemRepository;

    public ProductItemService(ProductItemRepository productItemRepository) {
        this.productItemRepository = productItemRepository;
    }

    public ProductItem create(ProductItemDto productItemDto){
        new ProductItem();
        return productItemRepository.save(ProductItem.builder()
                .id(productItemDto.getId())
                .productId(productItemDto.getProductId())
                .price(productItemDto.getPrice())
                .quantity(productItemDto.getQuantity())
                .productName(productItemDto.toString())
                .build()
        );
    }

    public List<ProductItem> readAll(){return productItemRepository.findAll();}

    public ProductItem update(ProductItem productItem){
        return productItemRepository.save(productItem);
    }

    public void delete(Long id){
        productItemRepository.deleteById(id);
    }
}
