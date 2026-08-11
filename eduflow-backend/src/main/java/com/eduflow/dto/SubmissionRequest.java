package com.eduflow.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRequest {
    private String submissionUrl;
    private String submissionFileName;
    private String submissionText;

    public String getSubmissionUrl() { return submissionUrl; }
    public void setSubmissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; }
    public String getSubmissionFileName() { return submissionFileName; }
    public void setSubmissionFileName(String submissionFileName) { this.submissionFileName = submissionFileName; }
    public String getSubmissionText() { return submissionText; }
    public void setSubmissionText(String submissionText) { this.submissionText = submissionText; }
}
