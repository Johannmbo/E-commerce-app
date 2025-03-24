package com.example.billingservice.Controller;

import com.example.billingservice.Dto.BillDto;
import com.example.billingservice.Entities.Bill;
import com.example.billingservice.Services.BillService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/billing-service")
@AllArgsConstructor
public class BillController {
    private BillService billService;

    @PostMapping("/addBill")
    public ResponseEntity<Bill> create (@RequestBody BillDto dto) {
        return new ResponseEntity<>(billService.create(dto), HttpStatus.OK);
    }
    @GetMapping("/listBills")
    public ResponseEntity<List<Bill>>readAll(){
        return new ResponseEntity<>(billService.readAll(), HttpStatus.OK);
    }
    @PutMapping("/updateBill")
    public ResponseEntity<Bill> update(@RequestBody Bill bill){
        return new ResponseEntity<>(billService.update(bill), HttpStatus.OK);
    }

    @DeleteMapping("/deleteBill/{id}")
    public ResponseEntity<Bill> delete(@PathVariable Long id){
        billService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
