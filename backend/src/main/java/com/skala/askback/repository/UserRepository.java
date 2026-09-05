package com.skala.askback.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skala.askback.entity.User;

// 목록 조회만 필요한 현재 요구사항은 JpaRepository 기본 제공 메서드(findAll)로 충분
public interface UserRepository extends JpaRepository<User, Long> {
}
