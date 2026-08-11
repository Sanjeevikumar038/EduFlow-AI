package com.eduflow.service;

import com.eduflow.dto.FacultyWorkloadDto;
import com.eduflow.entity.Role;
import com.eduflow.entity.TimetableEntry;
import com.eduflow.entity.User;
import com.eduflow.repository.CourseClassroomRepository;
import com.eduflow.repository.TimetableEntryRepository;
import com.eduflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AdminAnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseClassroomRepository classroomRepository;

    @Autowired
    private TimetableEntryRepository timetableEntryRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminERPAnalytics() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalFaculty = userRepository.countByRole(Role.FACULTY);
        long totalClassrooms = classroomRepository.count();

        Map<String, Object> deptStats = new LinkedHashMap<>();
        deptStats.put("M.Tech CSE", Map.of("students", 60, "avgAttendance", 88.4, "passPercentage", 94.0));
        deptStats.put("B.Tech CSE", Map.of("students", 180, "avgAttendance", 85.2, "passPercentage", 91.5));
        deptStats.put("Information Technology", Map.of("students", 120, "avgAttendance", 86.0, "passPercentage", 92.8));

        Map<String, Object> res = new HashMap<>();
        res.put("totalStudents", totalStudents);
        res.put("totalFaculty", totalFaculty);
        res.put("totalClassrooms", totalClassrooms);
        res.put("departmentStats", deptStats);
        res.put("systemHealth", "Optimal");

        return res;
    }

    @Transactional(readOnly = true)
    public List<FacultyWorkloadDto> getFacultyWorkload() {
        List<User> facultyList = userRepository.findByRole(Role.FACULTY);
        List<FacultyWorkloadDto> list = new ArrayList<>();

        for (User f : facultyList) {
            List<TimetableEntry> entries = timetableEntryRepository.findByFacultyId(f.getId());
            long allocated = entries != null ? entries.size() : 0;
            int maxPeriods = 20;
            double utilization = Math.min(100.0, (allocated * 100.0) / maxPeriods);
            String status = allocated > 14 ? "Heavy Load" : (allocated >= 6 ? "Balanced" : "Under Utilized");

            FacultyWorkloadDto dto = FacultyWorkloadDto.builder()
                    .facultyId(f.getId())
                    .facultyName(f.getName())
                    .department(f.getDepartment() != null ? f.getDepartment() : "M.Tech CSE")
                    .allocatedPeriods(allocated)
                    .availablePeriods(maxPeriods)
                    .utilizationPercentage(utilization)
                    .workloadStatus(status)
                    .build();
            list.add(dto);
        }

        return list;
    }

    private double shadowPercentage(double val) { return val; }
}
