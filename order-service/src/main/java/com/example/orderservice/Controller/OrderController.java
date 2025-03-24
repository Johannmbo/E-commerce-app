package com.example.orderservice.Controller;

import com.example.orderservice.Dto.OrderDto;
import com.example.orderservice.Entities.Orders;
import com.example.orderservice.Services.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/order-service")
@AllArgsConstructor
public class OrderController {
    private OrderService orderService;

    @PostMapping("/addOrder")
    public ResponseEntity<Orders> create (@RequestBody OrderDto dto){
        return new ResponseEntity<>(orderService.create(dto), HttpStatus.OK);
    }

    @GetMapping("/listOrders")
    public ResponseEntity<List<Orders>>readAll(){
        return new ResponseEntity<>(orderService.readAll(), HttpStatus.OK);
    }

    @PutMapping("/updateOrders")
    public ResponseEntity<Orders> update(@RequestBody Orders order){
        return new ResponseEntity<>(orderService.update(order), HttpStatus.OK);
    }


    @DeleteMapping("/deleteOrder/{id}")
    public ResponseEntity<Orders> delete(@PathVariable Long id){
        orderService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
