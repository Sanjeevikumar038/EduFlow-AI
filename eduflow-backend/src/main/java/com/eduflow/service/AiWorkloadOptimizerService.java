package com.eduflow.service;

import com.eduflow.dto.AiSmartAllocationRequest;
import com.eduflow.dto.AiSmartAllocationResultDto;

import java.util.List;

public interface AiWorkloadOptimizerService {
    AiSmartAllocationResultDto generateSmartWorkloadAllocation(AiSmartAllocationRequest request);
    AiSmartAllocationResultDto approveAllocationVersion(String versionName);
    List<String> getAvailableVersionNames();
    AiSmartAllocationResultDto getResultByVersionName(String versionName);
}
