-- ============================================================
-- Student Leave Management System - PostgreSQL Schema (NeonDB)
-- ============================================================

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  UNIQUE NOT NULL,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(20)   NOT NULL DEFAULT 'student'
                              CHECK (role IN ('student', 'faculty')),
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- LEAVE REQUESTS TABLE
-- ============================================================
CREATE TABLE leave_requests (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type      VARCHAR(50)   NOT NULL,
    start_date      DATE          NOT NULL,
    end_date        DATE          NOT NULL,
    reason          TEXT          NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
    faculty_remark  TEXT,
    applied_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_leave_requests_student_id ON leave_requests(student_id);
CREATE INDEX idx_leave_requests_status     ON leave_requests(status);
CREATE INDEX idx_users_email               ON users(email);

-- ============================================================
-- SEED DATA
-- ============================================================
-- Passwords are bcrypt hashes of the plaintext shown in comments.
-- faculty@college.edu   -> password: Faculty@123
-- alice@student.edu     -> password: Student@123
-- bob@student.edu       -> password: Student@123
--
-- Hashes generated with bcryptjs (cost factor 10):

INSERT INTO users (name, email, password, role) VALUES
(
    'Dr. Priya Sharma',
    'faculty@college.edu',
    '$2a$10$/hn3jxY1lJZYxyt7Vn91h.c9CekBLxsrwbIK3PyDyU0mzRYikz6te',
    'faculty'
),
(
    'Alice Johnson',
    'alice@student.edu',
    '$2a$10$jvbUrQIaIj5OjAh4gjTDP.CznZk3xZzvM0hN4UtepXHrdTtQfSeDq',
    'student'
),
(
    'Bob Williams',
    'bob@student.edu',
    '$2a$10$jvbUrQIaIj5OjAh4gjTDP.CznZk3xZzvM0hN4UtepXHrdTtQfSeDq',
    'student'
);

-- Seed leave requests for Alice (id=2) and Bob (id=3)
INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason, status, faculty_remark) VALUES
(2, 'Sick Leave',   '2025-06-02', '2025-06-04', 'Fever and cold, doctor advised rest.',      'approved', 'Get well soon. Approved.'),
(2, 'Casual Leave', '2025-06-10', '2025-06-11', 'Family function - sister''s wedding.',       'pending',  NULL),
(3, 'Sick Leave',   '2025-06-05', '2025-06-06', 'Stomach infection.',                         'rejected', 'Medical certificate not submitted.'),
(3, 'Casual Leave', '2025-06-15', '2025-06-15', 'Personal errand, need one day off.',         'pending',  NULL);
