package com.example.inventoryservice.Services;

import com.example.inventoryservice.Dto.DiscountDto;
import com.example.inventoryservice.Entities.Discount;
import com.example.inventoryservice.Repositories.DiscountRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class DiscountService {
    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    public Discount create(DiscountDto discountDto) {
        return discountRepository.save(Discount.builder()
                .id(discountDto.getId())
                .productId(discountDto.getProductId())
                .discountPercent(Double.parseDouble(String.valueOf(discountDto.getDiscountPercentage())))
                .build());
    }

    public List<Discount> readAll() {return discountRepository.findAll();}

    public Discount update(Discount discount){
        return discountRepository.save(discount);
    }

    public void delete(Long id){
        discountRepository.deleteById(id);
    }
}
