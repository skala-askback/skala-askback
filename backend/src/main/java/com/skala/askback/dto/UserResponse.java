package com.skala.askback.dto;

import com.skala.askback.entity.Role;
import com.skala.askback.entity.User;

// 클라이언트에 응답으로 내려줄 사용자 정보 (요구사항: id, name, role 만 노출)
// record 사용으로 불변 DTO를 간결하게 표현 (password_hash 등 민감 정보는 절대 포함하지 않음)
public record UserResponse(
        Long id,
        String name,
        Role role) {

    // 엔티티 -> DTO 변환 책임을 DTO 쪽에 두어 서비스 코드를 간결하게 유지
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getRole());
    }
}
