package com.example.crop.repository;

import com.example.crop.model.Solution;
import com.example.crop.model.DiseaseReport;
import com.example.crop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolutionRepository extends JpaRepository<Solution, Long> {
    List<Solution> findByReport(DiseaseReport report);
    List<Solution> findByFarmer(User farmer);
    long countByFarmer(User farmer);
}