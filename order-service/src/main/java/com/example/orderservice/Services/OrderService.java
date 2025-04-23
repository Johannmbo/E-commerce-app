package com.example.orderservice.Services;

import com.example.orderservice.Dto.OrderDto;
import com.example.orderservice.Entities.Orders;
import com.example.orderservice.Repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
    @Transactional

    public Orders create(OrderDto orderDto) {
        new Orders();
        return orderRepository.save(Orders.builder()
                        .id(orderDto.getId())
                        .orderDate(orderDto.getOrderDate())
                        .orderItem(orderDto.getOrderItem())
                        .orderStatus(orderDto.getOrderStatus())
                        .orderType(orderDto.getOrderType())
                .build());
    }

    public List<Orders> readAll() {return orderRepository.findAll();}

    public Orders update (Orders order) {return orderRepository.save(order);}

    public void delete (Long id) {
        orderRepository.deleteById(id);
    }
}
