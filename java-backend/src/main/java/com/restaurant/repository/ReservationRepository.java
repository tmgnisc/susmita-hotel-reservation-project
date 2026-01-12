package com.restaurant.repository;

import com.restaurant.model.TableReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<TableReservation, String> {
    List<TableReservation> findByUserId(String userId);
    List<TableReservation> findByStatus(TableReservation.ReservationStatus status);
    List<TableReservation> findByReservationDate(LocalDate date);
    
    @Query("SELECT r FROM TableReservation r WHERE r.table.id = :tableId " +
           "AND r.reservationDate = :date AND r.reservationTime = :time " +
           "AND r.status NOT IN ('CANCELLED', 'COMPLETED')")
    List<TableReservation> findOverlappingReservations(
        @Param("tableId") String tableId,
        @Param("date") LocalDate date,
        @Param("time") LocalTime time
    );
}

