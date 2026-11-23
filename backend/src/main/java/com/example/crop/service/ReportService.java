package com.example.crop.service;

import com.example.crop.model.*;
import com.example.crop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DiseaseReportRepository reportRepo;
    private final AlertRepository alertRepo;
    private final UserRepository userRepo;

    public DiseaseReport submit(String cropType, String symptoms,
                                String village, String district,
                                String state, String farmerEmail) {

        User farmer = userRepo.findByEmail(farmerEmail)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        DiseaseReport report = DiseaseReport.builder()
                .farmer(farmer)
                .cropType(cropType)
                .symptoms(symptoms)
                .village(village)
                .district(district)
                .state(state)
                .build();

        return reportRepo.save(report);
    }

    public List<DiseaseReport> getMyReports(String farmerEmail) {
        User farmer = userRepo.findByEmail(farmerEmail)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        return reportRepo.findByFarmer(farmer);
    }

    public List<DiseaseReport> getPending() {
        return reportRepo.findByStatus(DiseaseReport.Status.PENDING);
    }

    public List<DiseaseReport> getVerified() {
        return reportRepo.findByStatus(DiseaseReport.Status.VERIFIED);
    }

    public DiseaseReport getById(Long id) {
        return reportRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public DiseaseReport verify(Long reportId, String note) {
        DiseaseReport report = getById(reportId);
        report.setStatus(DiseaseReport.Status.VERIFIED);
        report.setAdminNote(note);
        report.setVerifiedAt(LocalDateTime.now());
        reportRepo.save(report);

        // Auto-create public alert
        Alert alert = Alert.builder()
                .report(report)
                .title(report.getCropType() + " Disease Outbreak — " + report.getVillage())
                .description(report.getSymptoms())
                .village(report.getVillage())
                .district(report.getDistrict())
                .build();
        alertRepo.save(alert);

        return report;
    }

    public DiseaseReport reject(Long reportId, String note) {
        DiseaseReport report = getById(reportId);
        report.setStatus(DiseaseReport.Status.REJECTED);
        report.setAdminNote(note);
        return reportRepo.save(report);
    }
}