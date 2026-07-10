package com.eduflow.repository;

import com.eduflow.entity.CodingQuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingQuestionBankRepository extends JpaRepository<CodingQuestionBank, Long> {
    List<CodingQuestionBank> findByActiveTrue();
}
