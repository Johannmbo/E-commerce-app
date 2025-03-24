package com.example.billingservice.Services;

import com.example.billingservice.Dto.BillDto;
import com.example.billingservice.Entities.Bill;
import com.example.billingservice.Entities.ProductItem;
import com.example.billingservice.Repository.BillRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class BillService {
    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public Bill create(BillDto billDto) {
        return billRepository.save(Bill.builder()
                .id(billDto.getId())
                .billingDate(billDto.getBillingDate())
                .customerId(billDto.getCustomerId())
                .productItems((List<ProductItem>) billDto.getProductItem())
                .build()
        );
    }

    public List<Bill> readAll() {return billRepository.findAll();}

    public Bill update(Bill bill){
        return billRepository.save(bill);
    }

    public void delete(Long id){
        billRepository.deleteById(id);
    }

}
