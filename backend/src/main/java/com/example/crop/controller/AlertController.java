package com.example.crop.controller;

import com.example.crop.model.Alert;
import com.example.crop.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> active() {
        return ResponseEntity.ok(alertService.getActive());
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<Alert>> byDistrict(@PathVariable String district) {
        return ResponseEntity.ok(alertService.getByDistrict(district));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Alert> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.deactivate(id));
    }
}