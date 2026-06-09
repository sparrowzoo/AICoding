package com.example.taobao.service;

import com.example.taobao.dto.OrderDTO;
import com.example.taobao.entity.*;
import com.example.taobao.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public OrderDTO createOrder(String userId) {
        // 1. 查询用户购物车
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty for user: " + userId);
        }

        // 2. 检查所有商品库存并扣减
        for (Cart cart : cartItems) {
            Product product = productRepository.findById(cart.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + cart.getProductId()));

            if (product.getStock() < cart.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName()
                        + ", requested: " + cart.getQuantity() + ", available: " + product.getStock());
            }

            product.setStock(product.getStock() - cart.getQuantity());
            productRepository.save(product);
        }

        // 3. 创建订单
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);
        Order savedOrder = orderRepository.save(order);

        // 4. 生成订单项
        BigDecimal total = BigDecimal.ZERO;
        for (Cart cart : cartItems) {
            Product product = productRepository.findById(cart.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + cart.getProductId()));

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cart.getQuantity()));

            OrderItem item = new OrderItem();
            item.setOrderId(savedOrder.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(cart.getQuantity());
            item.setSubtotal(subtotal);
            orderItemRepository.save(item);

            total = total.add(subtotal);
        }

        // 更新订单总金额
        savedOrder.setTotalAmount(total);
        orderRepository.save(savedOrder);

        // 5. 清空购物车
        cartRepository.deleteByUserId(userId);

        // 6. 返回订单
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(savedOrder.getId());
        return OrderDTO.fromEntity(savedOrder, orderItems);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return OrderDTO.fromEntity(order, items);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(String userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return OrderDTO.fromEntity(order, items);
                })
                .collect(Collectors.toList());
    }

    public OrderDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order already cancelled with id: " + orderId);
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus() + " with id: " + orderId);
        }

        // 恢复库存
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            });
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        return OrderDTO.fromEntity(saved, items);
    }
}
