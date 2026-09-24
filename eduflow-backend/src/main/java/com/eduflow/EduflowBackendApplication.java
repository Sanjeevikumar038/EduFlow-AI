package com.eduflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class EduflowBackendApplication {

    @PostConstruct
    public void init() {
        // Force the JVM to use Indian Standard Time (IST) 
        // to prevent time discrepancies when deployed to Render (UTC)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

	public static void main(String[] args) {
		SpringApplication.run(EduflowBackendApplication.class, args);
	}

}
