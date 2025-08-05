-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 05, 2025 at 07:46 AM
-- Server version: 9.1.0
-- PHP Version: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prek_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
CREATE TABLE IF NOT EXISTS `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` enum('coloring','letter_match','bubble_pop','counting','emotion_match','family_tree','digital_painting','forest_hunt') NOT NULL,
  `description` text,
  `difficulty` enum('easy','medium','hard') DEFAULT 'easy',
  `image_path` varchar(500) DEFAULT NULL,
  `colors` json DEFAULT NULL,
  `data` json DEFAULT NULL,
  `status` enum('active','inactive','deleted') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `topic_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `learning_objectives` text,
  `prerequisites` text,
  `chapter_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `estimated_duration` int DEFAULT '10',
  `max_attempts` int DEFAULT '3',
  `passing_score` int DEFAULT '70',
  `is_adaptive` tinyint(1) DEFAULT '0',
  `adaptive_rules` json DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `lesson_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `topic_id` (`topic_id`),
  KEY `created_by` (`created_by`),
  KEY `chapter_id` (`chapter_id`),
  KEY `subject_id` (`subject_id`),
  KEY `idx_activities_hierarchy` (`grade_id`,`subject_id`,`book_id`,`chapter_id`,`topic_id`),
  KEY `idx_activities_type` (`type`),
  KEY `idx_activities_status` (`status`),
  KEY `unit_id` (`unit_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `book_id` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
CREATE TABLE IF NOT EXISTS `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grade_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `cover_image` varchar(500) DEFAULT NULL,
  `order_number` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `academic_year` varchar(20) NOT NULL DEFAULT '2024-2025',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade_book` (`grade_id`,`title`,`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `children`
--

DROP TABLE IF EXISTS `children`;
CREATE TABLE IF NOT EXISTS `children` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `age` int NOT NULL,
  `gender` enum('boy','girl') COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_children_parent` (`parent_id`),
  KEY `idx_children_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `children`
--

INSERT INTO `children` (`id`, `parent_id`, `first_name`, `username`, `email`, `password`, `age`, `gender`, `avatar`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 10, 'Zaki', 'zaki_11_', 'zaki_11_@child.local', 'not_used', 3, 'boy', '/avatar/boy4.png', 1, '2025-08-01 06:38:21', '2025-08-01 06:38:21'),
(2, 10, 'Zaki', 'zaki11', 'zaki11@child.local', 'not_used', 4, 'boy', '/avatar/boy4.png', 1, '2025-08-01 06:39:33', '2025-08-01 06:39:33'),
(3, 12, 'Kid', 'kid', 'kid@child.local', 'not_used', 4, 'girl', '/avatar/girl1.png', 1, '2025-08-01 09:58:06', '2025-08-01 09:58:06'),
(4, 10, 'new', 'new', 'new@child.local', 'not_used', 4, 'girl', '/avatar/girl1.png', 1, '2025-08-01 10:47:57', '2025-08-01 10:47:57');

-- --------------------------------------------------------

--
-- Table structure for table `child_progress`
--

DROP TABLE IF EXISTS `child_progress`;
CREATE TABLE IF NOT EXISTS `child_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `activity_id` int NOT NULL,
  `lesson_id` int DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `progress_value` int DEFAULT '0',
  `score` int DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `time_spent` int DEFAULT '0',
  `attempts_count` int DEFAULT '0',
  `last_attempt_at` timestamp NULL DEFAULT NULL,
  `teacher_feedback` text,
  `teacher_score` int DEFAULT NULL,
  `is_assessed` tinyint(1) DEFAULT '0',
  `assessed_by` int DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_child_activity` (`child_id`,`activity_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `unit_id` (`unit_id`),
  KEY `book_id` (`book_id`),
  KEY `assessed_by` (`assessed_by`),
  KEY `idx_child_progress_hierarchy` (`grade_id`,`book_id`,`unit_id`,`lesson_id`),
  KEY `idx_child_progress_child` (`child_id`),
  KEY `idx_child_progress_activity` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `academic_year` varchar(20) DEFAULT '2024-2025',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade_name` (`name`,`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `lesson_number` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_unlocked` tinyint(1) DEFAULT '0',
  `unlocked_by` int DEFAULT NULL,
  `unlocked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_unit_lesson` (`unit_id`,`lesson_number`),
  KEY `unlocked_by` (`unlocked_by`),
  KEY `idx_lessons_unlock` (`is_unlocked`,`unlocked_at`),
  KEY `idx_lessons_unit` (`unit_id`,`lesson_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Stand-in structure for view `letterpath_data`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `letterpath_data`;
CREATE TABLE IF NOT EXISTS `letterpath_data` (
`unit_id` int
,`unit_title` varchar(255)
,`unit_description` text
,`level_number` int
,`lesson_id` int
,`lesson_title` varchar(255)
,`lesson_unlocked` tinyint(1)
,`book_id` int
,`book_title` varchar(255)
,`grade_id` int
,`grade_name` varchar(50)
,`total_activities` bigint
,`completed_activities` bigint
,`completion_score` decimal(5,2)
,`completed_at` timestamp
,`status` varchar(9)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_books`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `student_books`;
CREATE TABLE IF NOT EXISTS `student_books` (
`book_id` int
,`book_title` varchar(255)
,`book_description` text
,`grade_name` varchar(50)
,`student_id` int
);

-- --------------------------------------------------------

--
-- Table structure for table `student_enrollments`
--

DROP TABLE IF EXISTS `student_enrollments`;
CREATE TABLE IF NOT EXISTS `student_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `grade_id` int NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `enrollment_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_enrollment` (`student_id`,`grade_id`,`academic_year`),
  KEY `idx_student_enrollments_student` (`student_id`),
  KEY `idx_student_enrollments_grade` (`grade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_grade_assignments`
--

DROP TABLE IF EXISTS `teacher_grade_assignments`;
CREATE TABLE IF NOT EXISTS `teacher_grade_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `grade_id` int NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_grade` (`teacher_id`,`grade_id`,`academic_year`),
  KEY `idx_teacher_assignments_teacher` (`teacher_id`),
  KEY `idx_teacher_assignments_grade` (`grade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
CREATE TABLE IF NOT EXISTS `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `unit_number` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_unlocked` tinyint(1) DEFAULT '0',
  `unlocked_by` int DEFAULT NULL,
  `unlocked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_book_unit` (`book_id`,`unit_number`),
  KEY `idx_units_book` (`book_id`,`unit_number`),
  KEY `unlocked_by` (`unlocked_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `unit_completions`
--

DROP TABLE IF EXISTS `unit_completions`;
CREATE TABLE IF NOT EXISTS `unit_completions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completion_score` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_child_unit_completion` (`child_id`,`unit_id`),
  KEY `idx_unit_completions_child` (`child_id`),
  KEY `idx_unit_completions_unit` (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` enum('admin','teacher','parent','student') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'student',
  `first_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `max_children` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `username_2` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `updated_at`, `role`, `first_name`, `last_name`, `is_active`, `avatar`, `max_children`) VALUES
(8, 'admin1', 'info@bylinelearning.com', '$2b$10$U0wXs2mwUNm3OTBCAEFeNOhvYEUjJcWag7YIwxUgaz9F9CFqx7j1m', '2025-07-31 10:35:52', '2025-07-31 10:35:52', 'admin', 'admin', 'Byline', 1, NULL, 0),
(9, 'teacher1', 'Teacher@demo.com', '$2b$10$6euwgrA8R2Ep7qthKtH1A.RZruzyhuOI9Trbc4rLSiz7S23dEUsz6', '2025-07-31 10:36:53', '2025-07-31 10:36:53', 'teacher', 'Teacher', 'User', 1, NULL, 0),
(10, 'parent1', 'Parent@demo.com', '$2b$10$R.y3YD.ctqLjxLYTzT5/eOcPsWAWQaLdXFyTgK/LP8w1FkY21yCU.', '2025-07-31 10:53:40', '2025-08-01 08:19:59', 'parent', 'Parent', 'User', 1, NULL, 3),
(12, 'parent2', 'parent2@demo.com', '$2b$10$260bm/VYlXxw2mzfKFhtIOqgyUwJbhOIhRwFAhJHWSNR2txas1iM.', '2025-08-01 09:48:00', '2025-08-01 09:48:00', 'parent', 'Parent', '2', 1, NULL, 1);

-- --------------------------------------------------------

--
-- Structure for view `letterpath_data`
--
DROP TABLE IF EXISTS `letterpath_data`;

DROP VIEW IF EXISTS `letterpath_data`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `letterpath_data`  AS SELECT `u`.`id` AS `unit_id`, `u`.`title` AS `unit_title`, `u`.`description` AS `unit_description`, `u`.`unit_number` AS `level_number`, `l`.`id` AS `lesson_id`, `l`.`title` AS `lesson_title`, `l`.`is_unlocked` AS `lesson_unlocked`, `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `g`.`id` AS `grade_id`, `g`.`name` AS `grade_name`, count(`a`.`id`) AS `total_activities`, count((case when (`cp`.`completed` = 1) then 1 end)) AS `completed_activities`, `uc`.`completion_score` AS `completion_score`, `uc`.`completed_at` AS `completed_at`, (case when (`uc`.`completed_at` is not null) then 'completed' when (`u`.`is_unlocked` = 1) then 'available' else 'locked' end) AS `status` FROM ((((((`units` `u` join `books` `b` on((`u`.`book_id` = `b`.`id`))) join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) left join `lessons` `l` on((`u`.`id` = `l`.`unit_id`))) left join `activities` `a` on(((`u`.`id` = `a`.`unit_id`) and (`a`.`status` = 'active')))) left join `child_progress` `cp` on((`a`.`id` = `cp`.`activity_id`))) left join `unit_completions` `uc` on((`u`.`id` = `uc`.`unit_id`))) GROUP BY `u`.`id`, `uc`.`child_id` ;

-- --------------------------------------------------------

--
-- Structure for view `student_books`
--
DROP TABLE IF EXISTS `student_books`;

DROP VIEW IF EXISTS `student_books`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_books`  AS SELECT `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `b`.`description` AS `book_description`, `g`.`name` AS `grade_name`, `se`.`student_id` AS `student_id` FROM ((`books` `b` join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) join `student_enrollments` `se` on((`g`.`id` = `se`.`grade_id`))) WHERE ((`se`.`is_active` = 1) AND (`b`.`is_active` = 1)) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `activities_ibfk_10` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `activities_ibfk_11` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `activities_ibfk_12` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `activities_ibfk_13` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `activities_ibfk_14` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `activities_ibfk_15` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `activities_ibfk_16` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `activities_ibfk_17` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `activities_ibfk_18` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `activities_ibfk_19` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `activities_ibfk_20` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `activities_ibfk_21` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `activities_ibfk_22` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `activities_ibfk_23` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `activities_ibfk_24` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `activities_ibfk_3` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `activities_ibfk_4` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `activities_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `activities_ibfk_6` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `activities_ibfk_7` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `activities_ibfk_8` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `activities_ibfk_9` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`);

--
-- Constraints for table `children`
--
ALTER TABLE `children`
  ADD CONSTRAINT `children_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `child_progress`
--
ALTER TABLE `child_progress`
ADD CONSTRAINT `child_progress_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `child_progress_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`),
ADD CONSTRAINT `child_progress_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
ADD CONSTRAINT `child_progress_ibfk_4` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
ADD CONSTRAINT `child_progress_ibfk_5` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
ADD CONSTRAINT `child_progress_ibfk_6` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
ADD CONSTRAINT `child_progress_ibfk_7` FOREIGN KEY (`assessed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`unlocked_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  ADD CONSTRAINT `student_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`),
  ADD CONSTRAINT `student_enrollments_ibfk_2` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`);

--
-- Constraints for table `teacher_grade_assignments`
--
ALTER TABLE `teacher_grade_assignments`
  ADD CONSTRAINT `teacher_grade_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `teacher_grade_assignments_ibfk_2` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`);

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `units_ibfk_2` FOREIGN KEY (`unlocked_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `unit_completions`
--
ALTER TABLE `unit_completions`
  ADD CONSTRAINT `unit_completions_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`),
  ADD CONSTRAINT `unit_completions_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `unit_completions_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
