package com.example.crop.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "alerts")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "report_id", nullable = false)
    private DiseaseReport report;

    @Column(nullable = false)
    private String title;

    private String description;
    private String village;
    private String district;

    @Builder.Default
    private boolean active = true;

    private LocalDate alertDate;

    @PrePersist
    public void prePersist() {
        if (this.alertDate == null)
            this.alertDate = LocalDate.now();
    }
}