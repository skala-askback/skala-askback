package com.skala.askback.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skala.askback.dto.UserResponse;
import com.skala.askback.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // final 필드(userRepository)를 주입받는 생성자를 자동 생성 (생성자 주입)
public class UserService {

    private final UserRepository userRepository;

    // 전체 사용자 목록을 조회해 응답용 DTO 리스트로 변환
    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }
}
