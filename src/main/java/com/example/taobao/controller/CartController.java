package com.example.taobao.controller;

import com.example.taobao.dto.AddCartRequest;
import com.example.taobao.dto.CartItemDTO;
import com.example.taobao.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItemDTO>> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.findCartByUserId(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<CartItemDTO> addItem(@PathVariable String userId,
                                                @RequestBody AddCartRequest request) {
        CartItemDTO item = cartService.addItem(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/{userId}/update/{cartId}")
    public ResponseEntity<CartItemDTO> updateQuantity(@PathVariable String userId,
                                                       @PathVariable Long cartId,
                                                       @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null || quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }
        CartItemDTO item = cartService.updateQuantity(userId, cartId, quantity);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{userId}/remove/{cartId}")
    public ResponseEntity<Void> removeItem(@PathVariable String userId,
                                            @PathVariable Long cartId) {
        cartService.removeItem(userId, cartId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
