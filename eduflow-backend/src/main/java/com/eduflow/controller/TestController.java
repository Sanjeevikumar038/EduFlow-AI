package com.eduflow.controller;

import com.eduflow.dto.AiSmartAllocationRequest;
import com.eduflow.dto.AiSmartAllocationResultDto;
import com.eduflow.service.AiWorkloadOptimizerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private AiWorkloadOptimizerService aiWorkloadOptimizerService;

    @GetMapping("/student")
    public ResponseEntity<String> studentTest() {
        return ResponseEntity.ok("Access granted: STUDENT role verified.");
    }

    @GetMapping("/faculty")
    public ResponseEntity<String> facultyTest() {
        return ResponseEntity.ok("Access granted: FACULTY role verified.");
    }

    @GetMapping("/admin")
    public ResponseEntity<String> adminTest() {
        return ResponseEntity.ok("Access granted: ADMIN role verified.");
    }

    @GetMapping("/generate-live-workload")
    public ResponseEntity<AiSmartAllocationResultDto> generateLiveWorkload() {
        AiSmartAllocationRequest req = new AiSmartAllocationRequest();
        req.setAcademicYear("2026-2027");
        req.setSemesterType("Odd");
        req.setVersionName("v1_live_test");
        AiSmartAllocationResultDto result = aiWorkloadOptimizerService.generateSmartWorkloadAllocation(req);
        System.out.println("=== LIVE WORKLOAD GENERATION COMPLETED ===");
        System.out.println("Total Allocated: " + result.getTotalSubjectsAllocated());
        System.out.println("Average Workload: " + result.getAverageWorkloadHours() + " hrs/wk");
        if (result.getDepartmentCapacityReport() != null) {
            for (var cap : result.getDepartmentCapacityReport()) {
                System.out.println("Dept: " + cap.getDepartment() + " | Secs: " + cap.getSectionsGenerated() + " | AvgLoad: " + cap.getAverageLoad() + " hrs");
            }
        }
        return ResponseEntity.ok(result);
    }
}
