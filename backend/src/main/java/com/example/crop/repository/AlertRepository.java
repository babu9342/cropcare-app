package com.example.crop.repository;

import com.example.crop.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByActiveTrue();
    List<Alert> findByDistrict(String district);
    long countByActiveTrue();
}