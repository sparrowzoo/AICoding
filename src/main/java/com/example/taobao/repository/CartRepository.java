package com.example.taobao.repository;

import com.example.taobao.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByUserId(String userId);

    Optional<Cart> findByUserIdAndProductId(String userId, Long productId);

    void deleteByUserId(String userId);
}
