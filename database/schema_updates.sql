-- Database Schema Updates for Parent-Child Multi-tenancy
-- Run these SQL commands to update your existing database

-- 1. Add 'parent' role to users table
ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM('admin','teacher','parent','student') NOT NULL DEFAULT 'student';

-- 2. Create children table for parent-child relationship
CREATE TABLE IF NOT EXISTS `children` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('boy','girl') NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `parent_id` (`parent_id`),
  FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Create child_progress table to track individual progress
CREATE TABLE IF NOT EXISTS `child_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `activity_id` varchar(50) NOT NULL,
  `progress_value` int DEFAULT 0,
  `completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_child_activity` (`child_id`, `activity_type`, `activity_id`),
  KEY `child_id` (`child_id`),
  FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Create child_badges table
CREATE TABLE IF NOT EXISTS `child_badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `badge_name` varchar(100) NOT NULL,
  `badge_icon` varchar(255) DEFAULT NULL,
  `earned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `child_id` (`child_id`),
  FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Create child_streaks table
CREATE TABLE IF NOT EXISTS `child_streaks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `current_streak` int DEFAULT 0,
  `longest_streak` int DEFAULT 0,
  `last_activity_date` date DEFAULT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `child_id` (`child_id`),
  FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Update existing parent1 user to parent role (if exists)
UPDATE `users` SET `role` = 'parent' WHERE `email` = 'Parent@demo.com';

-- 7. Add indexes for better performance
CREATE INDEX `idx_children_parent` ON `children`(`parent_id`);
CREATE INDEX `idx_child_progress_child` ON `child_progress`(`child_id`);
CREATE INDEX `idx_child_progress_activity` ON `child_progress`(`activity_type`, `activity_id`);
CREATE INDEX `idx_children_active` ON `children`(`is_active`);
