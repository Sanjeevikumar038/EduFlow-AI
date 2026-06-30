package com.eduflow.service;

import com.eduflow.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getMyNotifications(String userEmail);
    void markAsRead(Long id, String userEmail);
    void createNotification(String userEmail, String message, String type);
}
