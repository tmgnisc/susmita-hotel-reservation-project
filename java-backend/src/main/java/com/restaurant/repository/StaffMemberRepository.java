package com.restaurant.repository;

import com.restaurant.model.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, String> {
    List<StaffMember> findByDepartment(String department);
    List<StaffMember> findByStatus(StaffMember.StaffStatus status);
}

