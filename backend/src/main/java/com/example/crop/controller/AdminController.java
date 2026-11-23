package com.example.crop.controller;

import com.example.crop.model.*;
import com.example.crop.repository.*;
import com.example.crop.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ReportService reportService;
    private final UserRepository userRepo;
    private final DiseaseReportRepository reportRepo;
    private final AlertRepository alertRepo;

    @GetMapping("/pending")
    public ResponseEntity<List<DiseaseReport>> pending() {
        return ResponseEntity.ok(reportService.getPending());
    }

    @PostMapping("/reports/{id}/verify")
    public ResponseEntity<DiseaseReport> verify(
            @PathVariable Long id,
            @RequestParam(defaultValue = "") String note) {
        return ResponseEntity.ok(reportService.verify(id, note));
    }

    @PostMapping("/reports/{id}/reject")
    public ResponseEntity<DiseaseReport> reject(
            @PathVariable Long id,
            @RequestParam(defaultValue = "") String note) {
        return ResponseEntity.ok(reportService.reject(id, note));
    }

    @GetMapping("/farmers")
    public ResponseEntity<List<User>> farmers() {
        return ResponseEntity.ok(
                userRepo.findAll().stream()
                        .filter(u -> u.getRole() == User.Role.FARMER)
                        .toList()
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
                "totalFarmers",    userRepo.countByRole(User.Role.FARMER),
                "pendingReports",  reportRepo.countByStatus(DiseaseReport.Status.PENDING),
                "verifiedReports", reportRepo.countByStatus(DiseaseReport.Status.VERIFIED),
                "activeAlerts",    alertRepo.countByActiveTrue(),
                "byCrop",          reportRepo.countByCropType(),
                "byDistrict",      reportRepo.countByDistrict()
        ));
    }
}