package com.eduflow;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.TimeZone;

public class TimeDiagnostic {
    public static void main(String[] args) {
        System.out.println("--- TIME DIAGNOSTIC ---");
        System.out.println("LocalDateTime.now(): " + LocalDateTime.now());
        System.out.println("Default TimeZone: " + TimeZone.getDefault().getID());
        System.out.println("ZoneId.systemDefault(): " + ZoneId.systemDefault());
        System.out.println("System.currentTimeMillis(): " + System.currentTimeMillis());
    }
}
