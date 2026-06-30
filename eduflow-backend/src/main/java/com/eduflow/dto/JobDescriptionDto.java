package com.eduflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionDto {
    private Long id;
    private String title;
    private String companyName;
    private String descriptionText;
    private LocalDateTime postedDate;
}
