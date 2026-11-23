package com.example.crop.controller;

import com.example.crop.model.Solution;
import com.example.crop.service.SolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solutions")
@RequiredArgsConstructor
public class SolutionController {

    private final SolutionService solutionService;

    @PostMapping
    public ResponseEntity<Solution> submit(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails user) {

        Long reportId = Long.parseLong(body.get("reportId").toString());
        String content = body.get("content").toString();
        return ResponseEntity.ok(solutionService.submit(reportId, content, user.getUsername()));
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<List<Solution>> byReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(solutionService.getByReport(reportId));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<Solution> vote(@PathVariable Long id) {
        return ResponseEntity.ok(solutionService.vote(id));
    }
}