package com.eduflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

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
}
