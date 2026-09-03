package com.skala.askback.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skala.askback.dto.UserResponse;
import com.skala.askback.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  // GET /api/user : 전체 사용자 목록 조회
  @GetMapping
  public List<UserResponse> getUsers() {
    return userService.getUsers();
  }
}
