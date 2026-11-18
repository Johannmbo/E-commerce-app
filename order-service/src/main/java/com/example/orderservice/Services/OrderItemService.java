package com.example.orderservice.Services;

import com.example.orderservice.Dto.OrderItemDto;
import com.example.orderservice.Entities.OrderItem;
import com.example.orderservice.Repository.OrderItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class OrderItemService {
    private final OrderItemRepository orderItemRepository;

    public OrderItemService(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public OrderItem create(OrderItemDto orderItemDto){
        new OrderItem();
        return orderItemRepository.save(OrderItem.builder()
                        .id(orderItemDto.getId())
                        .quantity(orderItemDto.getQuantity())
                .build());
    }

    public List<OrderItem> readAll(){return orderItemRepository.findAll();}

    public OrderItem update (OrderItem orderItem){return orderItemRepository.save(orderItem);}

    public void delete(Long id){
        orderItemRepository.deleteById(id);
    }
}
