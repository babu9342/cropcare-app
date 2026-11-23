package com.example.crop.controller;

import com.example.crop.model.DiseaseReport;
import com.example.crop.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<DiseaseReport> submit(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.ok(reportService.submit(
                body.get("cropType"),
                body.get("symptoms"),
                body.get("village"),
                body.get("district"),
                body.get("state"),
                user.getUsername()
        ));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<DiseaseReport>> mine(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reportService.getMyReports(user.getUsername()));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<DiseaseReport>> verified() {
        return ResponseEntity.ok(reportService.getVerified());
    }
}