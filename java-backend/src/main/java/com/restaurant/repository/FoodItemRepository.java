package com.restaurant.repository;

import com.restaurant.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, String> {
    List<FoodItem> findByCategory(String category);
    List<FoodItem> findByAvailable(Boolean available);
    List<FoodItem> findByCategoryAndAvailable(String category, Boolean available);
}

