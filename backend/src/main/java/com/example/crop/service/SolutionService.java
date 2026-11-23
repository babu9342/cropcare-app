package com.example.crop.service;

import com.example.crop.model.*;
import com.example.crop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SolutionService {

    private final SolutionRepository solutionRepo;
    private final DiseaseReportRepository reportRepo;
    private final UserRepository userRepo;

    public Solution submit(Long reportId, String content, String farmerEmail) {
        DiseaseReport report = reportRepo.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        User farmer = userRepo.findByEmail(farmerEmail)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        Solution solution = Solution.builder()
                .report(report)
                .farmer(farmer)
                .content(content)
                .build();

        return solutionRepo.save(solution);
    }

    public List<Solution> getByReport(Long reportId) {
        DiseaseReport report = reportRepo.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return solutionRepo.findByReport(report);
    }

    public Solution vote(Long solutionId) {
        Solution solution = solutionRepo.findById(solutionId)
                .orElseThrow(() -> new RuntimeException("Solution not found"));
        solution.setVotes(solution.getVotes() + 1);
        return solutionRepo.save(solution);
    }
}