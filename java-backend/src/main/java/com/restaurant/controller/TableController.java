package com.restaurant.controller;

import com.restaurant.dto.ApiResponse;
import com.restaurant.model.RestaurantTable;
import com.restaurant.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
@CrossOrigin(origins = "*")
public class TableController {
    
    private final TableService tableService;
    
    public TableController(TableService tableService) {
        this.tableService = tableService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<RestaurantTable>>> getAllTables(
            @RequestParam(required = false) String status) {
        List<RestaurantTable> tables = tableService.getAllTables(status);
        return ResponseEntity.ok(ApiResponse.success(tables));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantTable>> getTableById(@PathVariable String id) {
        RestaurantTable table = tableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.success(table));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<RestaurantTable>> createTable(@Valid @RequestBody TableRequest request) {
        RestaurantTable table = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Table created successfully", table));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantTable>> updateTable(
            @PathVariable String id,
            @RequestBody RestaurantTable table) {
        RestaurantTable updated = tableService.updateTable(id, table);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable String id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success("Table deleted successfully", null));
    }
}

