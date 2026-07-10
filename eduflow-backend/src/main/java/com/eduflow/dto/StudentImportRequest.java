package com.eduflow.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class StudentImportRequest {
    private List<StudentData> students;
    private List<String> departments;
    private List<String> batches;
    private List<String> sections;
    private Integer total_students;

    @Data
    public static class StudentData {
        private String name;
        private String roll_number;
        private String email;
        private String phone;
        private String department;
        private String batch;
        private Integer year;
        private String section;
        private String date_of_birth;
        private String gender;
        private String address;
        private String status;
        private ParentContact parent_contact;
    }

    @Data
    public static class ParentContact {
        private String father_name;
        private String father_phone;
        private String mother_name;
        private String mother_phone;
        private String guardian_email;
    }
}
