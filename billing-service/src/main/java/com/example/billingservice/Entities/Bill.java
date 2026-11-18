package com.example.billingservice.Entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Date;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "bills")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date billingDate;
    private long customerId;
    // Supprimer une facture supprime ses lignes ; en JSON, les lignes n'incluent pas la facture
    @OneToMany(mappedBy = "bill", cascade = CascadeType.REMOVE)
    @JsonIgnoreProperties(value = {"bill"}, allowSetters = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductItem> productItems;

}
