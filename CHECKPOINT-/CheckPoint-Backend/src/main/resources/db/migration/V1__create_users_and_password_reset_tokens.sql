-- ===============================
-- Migration V1: Initial tables
-- ===============================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP
);


INSERT INTO users (email, password, first_name, last_name)
VALUES ('admin@checkpoint.com', '$2a$10$Zq1eFv6KfK6OqgLk8/3k9uGZI8eHg5Q4rH5lDP9vhK1oO0fPjDHD6', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;