package com.example.billingservice.Services;

import com.example.billingservice.Dto.ProductItemDto;
import com.example.billingservice.Entities.Bill;
import com.example.billingservice.Entities.ProductItem;
import com.example.billingservice.Repository.BillRepository;
import com.example.billingservice.Repository.ProductItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ProductItemService {
    private final ProductItemRepository productItemRepository;
    private final BillRepository billRepository;

    public ProductItemService(ProductItemRepository productItemRepository, BillRepository billRepository) {
        this.productItemRepository = productItemRepository;
        this.billRepository = billRepository;
    }

    public ProductItem create(ProductItemDto productItemDto){
        return productItemRepository.save(ProductItem.builder()
                .id(productItemDto.getId())
                .productId(productItemDto.getProductId())
                .price(productItemDto.getPrice())
                .quantity(productItemDto.getQuantity())
                .productName(productItemDto.getProductName())
                .bill(findBill(productItemDto.getBill() == null ? null : productItemDto.getBill().getId()))
                .build()
        );
    }

    public List<ProductItem> readAll(){return productItemRepository.findAll();}

    public ProductItem update(ProductItem productItem){
        if (productItem.getBill() != null) {
            productItem.setBill(findBill(productItem.getBill().getId()));
        }
        return productItemRepository.save(productItem);
    }

    private Bill findBill(Long billId) {
        if (billId == null) return null;
        return billRepository.findById(billId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture " + billId + " introuvable"));
    }

    public void delete(Long id){
        productItemRepository.deleteById(id);
    }
}
