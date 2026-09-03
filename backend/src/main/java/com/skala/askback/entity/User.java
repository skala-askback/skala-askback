package com.skala.askback.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

// db/01_init.sql 의 users 테이블과 1:1로 매핑되는 엔티티
// ddl-auto: validate 이므로 컬럼 정의가 실제 테이블 스키마와 정확히 일치해야 함
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 프록시 생성을 위한 기본 생성자, 외부에서 무분별한 생성 방지
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    private Long id;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String name;

    // VARCHAR(20) 컬럼을 Role enum으로 매핑 (문자열 그대로 저장/조회)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "class_group")
    private Long classGroup; // 학생만 사용, null 허용

    @Column(name = "campus_region", length = 10)
    private String campusRegion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
