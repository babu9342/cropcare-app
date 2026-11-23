package com.example.crop.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "disease_reports")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DiseaseReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(nullable = false)
    private String cropType;

    @Column(nullable = false)
    private String symptoms;

    private String village;
    private String district;
    private String state;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    private String adminNote;
    private LocalDate reportDate;
    private LocalDateTime verifiedAt;

    @PrePersist
    public void prePersist() {
        if (this.reportDate == null)
            this.reportDate = LocalDate.now();
    }

    public enum Status { PENDING, VERIFIED, REJECTED }
}