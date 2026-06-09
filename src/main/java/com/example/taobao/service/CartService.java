package com.example.taobao.service;

import com.example.taobao.dto.AddCartRequest;
import com.example.taobao.dto.CartItemDTO;
import com.example.taobao.entity.Cart;
import com.example.taobao.entity.Product;
import com.example.taobao.repository.CartRepository;
import com.example.taobao.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CartItemDTO> findCartByUserId(String userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        return cartItems.stream()
                .map(this::toCartItemDTO)
                .collect(Collectors.toList());
    }

    public CartItemDTO addItem(String userId, AddCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName()
                    + ", requested: " + request.getQuantity() + ", available: " + product.getStock());
        }

        Optional<Cart> existing = cartRepository.findByUserIdAndProductId(userId, request.getProductId());
        Cart cart;
        if (existing.isPresent()) {
            cart = existing.get();
            cart.setQuantity(cart.getQuantity() + request.getQuantity());
        } else {
            cart = new Cart();
            cart.setUserId(userId);
            cart.setProductId(request.getProductId());
            cart.setQuantity(request.getQuantity());
        }

        Cart saved = cartRepository.save(cart);
        return toCartItemDTO(saved);
    }

    public CartItemDTO updateQuantity(String userId, Long cartId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartId));

        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("Cart item does not belong to user: " + userId);
        }

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be positive");
        }

        Product product = productRepository.findById(cart.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + cart.getProductId()));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName()
                    + ", requested: " + quantity + ", available: " + product.getStock());
        }

        cart.setQuantity(quantity);
        Cart saved = cartRepository.save(cart);
        return toCartItemDTO(saved);
    }

    public void removeItem(String userId, Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartId));

        if (!cart.getUserId().equals(userId)) {
            throw new RuntimeException("Cart item does not belong to user: " + userId);
        }

        cartRepository.delete(cart);
    }

    public void clearCart(String userId) {
        cartRepository.deleteByUserId(userId);
    }

    private CartItemDTO toCartItemDTO(Cart cart) {
        CartItemDTO dto = new CartItemDTO();
        dto.setCartId(cart.getId());
        dto.setProductId(cart.getProductId());
        dto.setQuantity(cart.getQuantity());

        productRepository.findById(cart.getProductId()).ifPresent(product -> {
            dto.setProductName(product.getName());
            dto.setPrice(product.getPrice());
            dto.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
        });

        return dto;
    }
}
