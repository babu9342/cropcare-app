package com.example.crop.service;

import com.example.crop.model.Alert;
import com.example.crop.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepo;

    public List<Alert> getActive() {
        return alertRepo.findByActiveTrue();
    }

    public List<Alert> getByDistrict(String district) {
        return alertRepo.findByDistrict(district);
    }

    public Alert deactivate(Long id) {
        Alert alert = alertRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setActive(false);
        return alertRepo.save(alert);
    }
}