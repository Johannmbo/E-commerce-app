package com.example.orderservice.Services;

import com.example.orderservice.Dto.OrderItemDto;
import com.example.orderservice.Entities.OrderItem;
import com.example.orderservice.Entities.Orders;
import com.example.orderservice.Repository.OrderItemRepository;
import com.example.orderservice.Repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class OrderItemService {
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;

    public OrderItemService(OrderItemRepository orderItemRepository, OrderRepository orderRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderItem create(OrderItemDto orderItemDto){
        return orderItemRepository.save(OrderItem.builder()
                        .id(orderItemDto.getId())
                        .quantity(orderItemDto.getQuantity())
                        .order(findOrder(orderItemDto.getOrderId()))
                .build());
    }

    public List<OrderItem> readAll(){return orderItemRepository.findAll();}

    public OrderItem update (OrderItem orderItem){
        if (orderItem.getOrder() != null) {
            orderItem.setOrder(findOrder(orderItem.getOrder().getId()));
        }
        return orderItemRepository.save(orderItem);
    }

    private Orders findOrder(Long orderId) {
        if (orderId == null) return null;
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande " + orderId + " introuvable"));
    }

    public void delete(Long id){
        orderItemRepository.deleteById(id);
    }
}
