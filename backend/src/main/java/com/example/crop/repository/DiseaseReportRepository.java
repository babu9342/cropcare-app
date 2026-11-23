package com.example.crop.repository;

import com.example.crop.model.DiseaseReport;
import com.example.crop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DiseaseReportRepository extends JpaRepository<DiseaseReport, Long> {
    List<DiseaseReport> findByFarmer(User farmer);
    List<DiseaseReport> findByStatus(DiseaseReport.Status status);
    long countByStatus(DiseaseReport.Status status);

    @Query("SELECT r.cropType, COUNT(r) FROM DiseaseReport r GROUP BY r.cropType")
    List<Object[]> countByCropType();

    @Query("SELECT r.district, COUNT(r) FROM DiseaseReport r GROUP BY r.district")
    List<Object[]> countByDistrict();
}