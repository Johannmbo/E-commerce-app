package com.example.inventoryservice.Services;

import com.example.inventoryservice.Dto.DiscountDto;
import com.example.inventoryservice.Entities.Discount;
import com.example.inventoryservice.Entities.Product;
import com.example.inventoryservice.Repositories.DiscountRepository;
import com.example.inventoryservice.Repositories.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class DiscountService {
    private final DiscountRepository discountRepository;
    private final ProductRepository productRepository;

    public DiscountService(DiscountRepository discountRepository, ProductRepository productRepository) {
        this.discountRepository = discountRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Discount create(DiscountDto discountDto) {
        Discount saved = discountRepository.save(Discount.builder()
                .id(discountDto.getId())
                .productId(discountDto.getProductId())
                .discountPercent(discountDto.getDiscountPercentage())
                .build());
        linkProducts(saved);
        return saved;
    }

    public List<Discount> readAll() {return discountRepository.findAll();}

    public Discount update(Discount discount){
        Discount saved = discountRepository.save(discount);
        linkProducts(saved);
        return saved;
    }

    public void delete(Long id){
        // détacher les produits d'abord, sinon la clé étrangère products.discount_id bloque la suppression
        for (Product p : productRepository.findByDiscount_Id(id)) {
            p.setDiscount(null);
        }
        productRepository.flush();
        discountRepository.deleteById(id);
    }

    /** Rattache la remise aux produits de même référence, et la détache des autres. */
    private void linkProducts(Discount discount) {
        for (Product p : productRepository.findByDiscount_Id(discount.getId())) {
            if (!Objects.equals(p.getProductId(), discount.getProductId())) {
                p.setDiscount(null);
            }
        }
        if (discount.getProductId() != null) {
            for (Product p : productRepository.findByProductId(discount.getProductId())) {
                p.setDiscount(discount);
            }
        }
    }
}
