package com.example.taobao.repository;

import com.example.taobao.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    List<Product> findByNameContaining(String keyword);
}
