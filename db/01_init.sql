-- user table 생성
CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL    PRIMARY KEY,   -- PostgreSQL 자동 증가 (MariaDB의 AUTO_INCREMENT 에 해당)
    login_id       VARCHAR(50)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    name           VARCHAR(50)  NOT NULL,
    role           VARCHAR(20)  NOT NULL,      -- STUDENT / PROFESSOR
    class_group    BIGINT       NULL,          -- 학생만 사용
    campus_region  VARCHAR(10)  NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_login_id UNIQUE (login_id)
);

-- 목데이터 생성
INSERT INTO users (login_id, password_hash, name, role, class_group, campus_region) VALUES
  ('stu001', '$2a$10$mockmockmockmockmockmoQ', '김학생', 'STUDENT', 4, 'G'),
  ('stu002', '$2a$10$mockmockmockmockmockmoQ', '이학생', 'STUDENT', 4, 'G'),
  ('prof001', '$2a$10$mockmockmockmockmockmoQ', '박교수', 'PROFESSOR', NULL, 'G');
