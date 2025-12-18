-- Coach AI Database Seed Script
-- This script populates the database with sample users for testing
-- Password for all users: test123

-- Insert Sample Users
INSERT INTO users (id, email, password, first_name, last_name, role, status, validated_at, joined_at, avatar_url, bio, phone, formation, niveau, last_active) VALUES
-- Admin User
('admin-001', 'admin@coachai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhLu', 'Admin', 'CoachAI', 'ADMIN', 'ACTIVE', NOW(), NOW(), 'https://i.pravatar.cc/150?img=1', 'Platform Administrator', '+212600000001', 'Computer Science', 'AVANCE', NOW()),

-- Trainer Users
('trainer-001', 'trainer1@coachai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhLu', 'Sarah', 'Johnson', 'TRAINER', 'ACTIVE', NOW(), NOW(), 'https://i.pravatar.cc/150?img=10', 'Expert in Web Development and Programming', '+212600000002', 'Software Engineering', 'AVANCE', NOW()),
('trainer-002', 'trainer2@coachai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhLu', 'Michael', 'Chen', 'TRAINER', 'ACTIVE', NOW(), NOW(), 'https://i.pravatar.cc/150?img=11', 'Data Science and Machine Learning Specialist', '+212600000003', 'Data Science', 'AVANCE', NOW()),

-- Regular Users (Students)
('user-001', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhLu', 'John', 'Doe', 'USER', 'ACTIVE', NOW(), NOW(), 'https://i.pravatar.cc/150?img=20', 'Aspiring Full Stack Developer', '+212600000005', 'Computer Science', 'DEBUTANT', NOW()),
('user-002', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhLu', 'Jane', 'Smith', 'USER', 'ACTIVE', NOW(), NOW(), 'https://i.pravatar.cc/150?img=21', 'Learning Data Analysis', '+212600000006', 'Business Analytics', 'INTERMEDIAIRE', NOW()),
('user-003', 'user3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhLu', 'Alex', 'Brown', 'USER', 'ACTIVE', NOW(), NOW(), 'https://i.pravatar.cc/150?img=22', 'UI/UX Design Enthusiast', '+212600000007', 'Design', 'DEBUTANT', NOW());

-- Display results
SELECT 'Database seeded successfully!' AS message,
       (SELECT COUNT(*) FROM users) AS total_users;
