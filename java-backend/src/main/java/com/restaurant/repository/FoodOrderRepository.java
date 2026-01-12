package com.restaurant.repository;

import com.restaurant.model.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, String> {
    List<FoodOrder> findByUserId(String userId);
    List<FoodOrder> findByStatus(FoodOrder.OrderStatus status);
}

