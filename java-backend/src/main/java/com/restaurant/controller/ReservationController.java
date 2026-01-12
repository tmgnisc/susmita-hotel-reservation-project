package com.restaurant.controller;

import com.restaurant.dto.ApiResponse;
import com.restaurant.model.TableReservation;
import com.restaurant.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:5173"})
public class ReservationController {
    
    private final ReservationService reservationService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TableReservation>>> getAllReservations(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status) {
        List<TableReservation> reservations = reservationService.getAllReservations(userId, status);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableReservation>> getReservationById(@PathVariable String id) {
        TableReservation reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<TableReservation>> createReservation(@RequestBody Map<String, Object> request) {
        TableReservation reservation = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Reservation created successfully", reservation));
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TableReservation>> updateReservationStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        TableReservation reservation = reservationService.updateReservationStatus(id, statusUpdate.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Reservation status updated", reservation));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelReservation(@PathVariable String id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled", null));
    }
}

