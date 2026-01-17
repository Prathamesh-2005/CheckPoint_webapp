-- =============================================
-- Migration V2: Add Google OAuth2 support columns
-- =============================================

-- Add google_id column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Optional: track login method (LOCAL / GOOGLE)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS login_method VARCHAR(20) DEFAULT 'LOCAL';
