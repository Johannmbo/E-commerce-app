package com.example.orderservice.Controller;

import com.example.orderservice.Dto.OrderItemDto;
import com.example.orderservice.Entities.OrderItem;
import com.example.orderservice.Services.OrderItemService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/order-service")
@AllArgsConstructor
public class OrderItemController {
    private OrderItemService orderItemService;

    @PostMapping("/addOrderItem")
    public ResponseEntity<OrderItem> create (@RequestBody OrderItemDto dto){
        return new ResponseEntity<>(orderItemService.create(dto), HttpStatus.OK);
    }

    @GetMapping("/listOrderItems")
    public ResponseEntity<List<OrderItem>>readAll(){
        return new ResponseEntity<>(orderItemService.readAll(), HttpStatus.OK);
    }

    @PutMapping("/updateOrderItems")
    public ResponseEntity<OrderItem> update(@RequestBody OrderItem orderItem){
        return new ResponseEntity<>(orderItemService.update(orderItem), HttpStatus.OK);
    }

    @DeleteMapping("/deleteOrderItem/{id}")
    public ResponseEntity<OrderItem> delete(@PathVariable Long id){
     orderItemService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
