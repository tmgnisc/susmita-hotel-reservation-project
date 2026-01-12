package com.restaurant.controller;

import com.restaurant.dto.ApiResponse;
import com.restaurant.model.FoodItem;
import com.restaurant.model.FoodOrder;
import com.restaurant.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/food")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:5173"})
public class FoodController {
    
    private final FoodService foodService;
    
    // Food Items endpoints
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<FoodItem>>> getAllFoodItems(
            @RequestParam(required = false) String category) {
        List<FoodItem> items = foodService.getAllFoodItems(category);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/items/{id}")
    public ResponseEntity<ApiResponse<FoodItem>> getFoodItemById(@PathVariable String id) {
        FoodItem item = foodService.getFoodItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }
    
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<FoodItem>> createFoodItem(@RequestBody FoodItem foodItem) {
        FoodItem created = foodService.createFoodItem(foodItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Food item created", created));
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<FoodItem>> updateFoodItem(
            @PathVariable String id,
            @RequestBody FoodItem foodItem) {
        FoodItem updated = foodService.updateFoodItem(id, foodItem);
        return ResponseEntity.ok(ApiResponse.success("Food item updated", updated));
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFoodItem(@PathVariable String id) {
        foodService.deleteFoodItem(id);
        return ResponseEntity.ok(ApiResponse.success("Food item deleted", null));
    }
    
    // Food Orders endpoints
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<FoodOrder>>> getAllOrders(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status) {
        List<FoodOrder> orders = foodService.getAllOrders(userId, status);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<FoodOrder>> getOrderById(@PathVariable String id) {
        FoodOrder order = foodService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<FoodOrder>> createOrder(@RequestBody Map<String, Object> request) {
        FoodOrder order = foodService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order created", order));
    }
    
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<FoodOrder>> updateOrderStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        FoodOrder order = foodService.updateOrderStatus(id, statusUpdate.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
}

