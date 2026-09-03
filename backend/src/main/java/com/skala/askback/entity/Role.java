package com.skala.askback.entity;

// users.role 컬럼 값(STUDENT / PROFESSOR)을 문자열 대신 타입으로 다루기 위한 enum
// 재사용성을 위해 다른 바일로 분리, 하나의 파일에 다 넣는 경우는 거의 없다.
public enum Role {
    STUDENT,
    PROFESSOR
}
