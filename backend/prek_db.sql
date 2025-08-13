-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 12, 2025 at 11:04 AM
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
-- Table structure for table `assessment_criteria`
--

DROP TABLE IF EXISTS `assessment_criteria`;
CREATE TABLE IF NOT EXISTS `assessment_criteria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `level_order` int NOT NULL DEFAULT '1',
  `color` varchar(7) DEFAULT '#000000',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_criteria_name` (`name`),
  KEY `idx_criteria_active` (`is_active`),
  KEY `idx_criteria_order` (`level_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

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
  UNIQUE KEY `unique_grade_book` (`grade_id`,`title`,`academic_year`),
  KEY `idx_books_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `children`
--

DROP TABLE IF EXISTS `children`;
CREATE TABLE IF NOT EXISTS `children` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `age` int NOT NULL,
  `gender` enum('boy','girl') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_children_parent` (`parent_id`),
  KEY `idx_children_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `completed` tinyint(1) DEFAULT '0',
  `assessment_criteria_id` int DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `time_spent` int DEFAULT '0',
  `attempts_count` int DEFAULT '0',
  `last_attempt_at` timestamp NULL DEFAULT NULL,
  `teacher_feedback` text,
  `teacher_notes` text,
  `is_assessed` tinyint(1) DEFAULT '0',
  `assessed_by` int DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `completion_file_path` varchar(500) DEFAULT NULL,
  `completion_data` json DEFAULT NULL,
  `time_spent_seconds` int DEFAULT '0',
  `status` enum('in_progress','completed','assessed','returned') DEFAULT 'in_progress',
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
  KEY `idx_child_progress_activity` (`activity_id`),
  KEY `idx_child_progress_assessment` (`assessment_criteria_id`),
  KEY `idx_child_progress_status` (`status`),
  KEY `idx_child_progress_assessed` (`assessed_at`),
  KEY `idx_child_progress_hierarchy_status` (`grade_id`,`book_id`,`unit_id`,`lesson_id`,`status`),
  KEY `idx_child_progress_child_status` (`child_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `completed_activities`
--

DROP TABLE IF EXISTS `completed_activities`;
CREATE TABLE IF NOT EXISTS `completed_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `activity_id` int NOT NULL,
  `lesson_id` int DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `completed_file_path` varchar(500) NOT NULL,
  `file_type` enum('image','video','audio','document') DEFAULT 'image',
  `file_size` int DEFAULT NULL,
  `completion_data` json DEFAULT NULL,
  `time_spent_seconds` int DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('submitted','assessed','returned') DEFAULT 'submitted',
  `assessed_by` int DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `assessment_criteria_id` int DEFAULT NULL,
  `teacher_feedback` text,
  `teacher_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_child_activity_completion` (`child_id`,`activity_id`),
  KEY `idx_completed_activities_child` (`child_id`),
  KEY `idx_completed_activities_activity` (`activity_id`),
  KEY `idx_completed_activities_lesson` (`lesson_id`),
  KEY `idx_completed_activities_unit` (`unit_id`),
  KEY `idx_completed_activities_book` (`book_id`),
  KEY `idx_completed_activities_grade` (`grade_id`),
  KEY `idx_completed_activities_status` (`status`),
  KEY `idx_completed_activities_assessed_by` (`assessed_by`),
  KEY `idx_completed_activities_criteria` (`assessment_criteria_id`),
  KEY `idx_completed_activities_submitted` (`completed_at`),
  KEY `idx_completed_activities_assessed` (`assessed_at`),
  KEY `idx_completed_activities_hierarchy` (`grade_id`,`book_id`,`unit_id`,`lesson_id`),
  KEY `idx_completed_activities_type_status` (`activity_id`,`status`),
  KEY `idx_completed_activities_child_status` (`child_id`,`status`)
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
  KEY `idx_lessons_unit` (`unit_id`,`lesson_number`),
  KEY `idx_lessons_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Stand-in structure for view `letterpath_data`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `letterpath_data`;
CREATE TABLE IF NOT EXISTS `letterpath_data` (
`book_id` int
,`book_title` varchar(255)
,`completed_activities` bigint
,`completed_at` timestamp
,`completion_score` decimal(5,2)
,`grade_id` int
,`grade_name` varchar(50)
,`lesson_id` int
,`lesson_title` varchar(255)
,`lesson_unlocked` tinyint(1)
,`level_number` int
,`status` varchar(9)
,`total_activities` bigint
,`unit_description` text
,`unit_id` int
,`unit_title` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `pending_assessments`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `pending_assessments`;
CREATE TABLE IF NOT EXISTS `pending_assessments` (
`activity_description` text
,`activity_id` int
,`activity_title` varchar(255)
,`activity_type` enum('coloring','letter_match','bubble_pop','counting','emotion_match','family_tree','digital_painting','forest_hunt')
,`assessed_at` timestamp
,`assessment_criteria` varchar(50)
,`assessor_name` varchar(50)
,`book_id` int
,`book_title` varchar(255)
,`child_avatar` varchar(255)
,`child_id` int
,`child_name` varchar(50)
,`child_username` varchar(50)
,`completed_at` timestamp
,`completed_file_path` varchar(500)
,`completion_data` json
,`completion_id` int
,`criteria_color` varchar(7)
,`file_type` enum('image','video','audio','document')
,`grade_id` int
,`grade_name` varchar(50)
,`lesson_id` int
,`lesson_title` varchar(255)
,`status` enum('submitted','assessed','returned')
,`teacher_feedback` text
,`teacher_notes` text
,`time_spent_seconds` int
,`unit_id` int
,`unit_title` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_books`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `student_books`;
CREATE TABLE IF NOT EXISTS `student_books` (
`book_description` text
,`book_id` int
,`book_title` varchar(255)
,`grade_name` varchar(50)
,`student_id` int
);

-- --------------------------------------------------------

--
-- Table structure for table `student_book_enrollments`
--

DROP TABLE IF EXISTS `student_book_enrollments`;
CREATE TABLE IF NOT EXISTS `student_book_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `book_id` int NOT NULL,
  `enrolled_by` int NOT NULL,
  `academic_year` varchar(20) NOT NULL DEFAULT '2024-2025',
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_book` (`student_id`,`book_id`,`academic_year`),
  KEY `idx_student_book_student` (`student_id`),
  KEY `idx_student_book_book` (`book_id`),
  KEY `idx_student_book_enrolled_by` (`enrolled_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Stand-in structure for view `student_enrolled_content`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `student_enrolled_content`;
CREATE TABLE IF NOT EXISTS `student_enrolled_content` (
`book_id` int
,`book_title` varchar(255)
,`first_name` varchar(50)
,`grade_name` varchar(50)
,`lesson_id` int
,`lesson_number` int
,`lesson_title` varchar(255)
,`student_id` int
,`unit_id` int
,`unit_number` int
,`unit_title` varchar(255)
,`username` varchar(50)
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
-- Table structure for table `student_lesson_enrollments`
--

DROP TABLE IF EXISTS `student_lesson_enrollments`;
CREATE TABLE IF NOT EXISTS `student_lesson_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `enrolled_by` int NOT NULL,
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson` (`student_id`,`lesson_id`),
  KEY `idx_student_lesson_student` (`student_id`),
  KEY `idx_student_lesson_lesson` (`lesson_id`),
  KEY `idx_student_lesson_enrolled_by` (`enrolled_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `student_unit_enrollments`
--

DROP TABLE IF EXISTS `student_unit_enrollments`;
CREATE TABLE IF NOT EXISTS `student_unit_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `enrolled_by` int NOT NULL,
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_unit` (`student_id`,`unit_id`),
  KEY `idx_student_unit_student` (`student_id`),
  KEY `idx_student_unit_unit` (`unit_id`),
  KEY `idx_student_unit_enrolled_by` (`enrolled_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Stand-in structure for view `teacher_assessment_summary`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `teacher_assessment_summary`;
CREATE TABLE IF NOT EXISTS `teacher_assessment_summary` (
`advanced_count` bigint
,`avg_time_spent` decimal(14,4)
,`completed_assessments` bigint
,`developing_count` bigint
,`emerging_count` bigint
,`first_assessment` timestamp
,`last_assessment` timestamp
,`pending_assessments` bigint
,`proficient_count` bigint
,`teacher_id` int
,`teacher_name` varchar(50)
,`total_submissions` bigint
);

-- --------------------------------------------------------

--
-- Table structure for table `teacher_book_assignments`
--

DROP TABLE IF EXISTS `teacher_book_assignments`;
CREATE TABLE IF NOT EXISTS `teacher_book_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `book_id` int NOT NULL,
  `academic_year` varchar(20) NOT NULL DEFAULT '2024-2025',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_teacher_book` (`teacher_id`,`book_id`,`academic_year`),
  KEY `idx_teacher_book_teacher` (`teacher_id`),
  KEY `idx_teacher_book_book` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Stand-in structure for view `teacher_book_summary`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `teacher_book_summary`;
CREATE TABLE IF NOT EXISTS `teacher_book_summary` (
`book_description` text
,`book_id` int
,`book_title` varchar(255)
,`enrolled_students` bigint
,`grade_id` int
,`grade_name` varchar(50)
,`teacher_id` int
,`total_lessons` bigint
,`total_units` bigint
,`unlocked_lessons` bigint
,`unlocked_units` bigint
);

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
  KEY `unlocked_by` (`unlocked_by`),
  KEY `idx_units_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `unit_completions`
--

DROP TABLE IF EXISTS `unit_completions`;
CREATE TABLE IF NOT EXISTS `unit_completions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `enrolled_by` int DEFAULT NULL,
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unit_id` int NOT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completion_score` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_child_unit_completion` (`child_id`,`unit_id`),
  KEY `idx_unit_completions_child` (`child_id`),
  KEY `idx_unit_completions_unit` (`unit_id`),
  KEY `idx_unit_completions_enrolled_by` (`enrolled_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` enum('admin','teacher','parent','student') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'student',
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `max_children` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `username_2` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `letterpath_data`
--
DROP TABLE IF EXISTS `letterpath_data`;

DROP VIEW IF EXISTS `letterpath_data`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `letterpath_data`  AS SELECT `u`.`id` AS `unit_id`, `u`.`title` AS `unit_title`, `u`.`description` AS `unit_description`, `u`.`unit_number` AS `level_number`, `l`.`id` AS `lesson_id`, `l`.`title` AS `lesson_title`, `l`.`is_unlocked` AS `lesson_unlocked`, `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `g`.`id` AS `grade_id`, `g`.`name` AS `grade_name`, count(`a`.`id`) AS `total_activities`, count((case when (`cp`.`completed` = 1) then 1 end)) AS `completed_activities`, `uc`.`completion_score` AS `completion_score`, `uc`.`completed_at` AS `completed_at`, (case when (`uc`.`completed_at` is not null) then 'completed' when (`u`.`is_unlocked` = 1) then 'available' else 'locked' end) AS `status` FROM ((((((`units` `u` join `books` `b` on((`u`.`book_id` = `b`.`id`))) join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) left join `lessons` `l` on((`u`.`id` = `l`.`unit_id`))) left join `activities` `a` on(((`u`.`id` = `a`.`unit_id`) and (`a`.`status` = 'active')))) left join `child_progress` `cp` on((`a`.`id` = `cp`.`activity_id`))) left join `unit_completions` `uc` on((`u`.`id` = `uc`.`unit_id`))) GROUP BY `u`.`id`, `uc`.`child_id` ;

-- --------------------------------------------------------

--
-- Structure for view `pending_assessments`
--
DROP TABLE IF EXISTS `pending_assessments`;

DROP VIEW IF EXISTS `pending_assessments`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pending_assessments`  AS SELECT `ca`.`id` AS `completion_id`, `c`.`id` AS `child_id`, `c`.`first_name` AS `child_name`, `c`.`username` AS `child_username`, `c`.`avatar` AS `child_avatar`, `a`.`id` AS `activity_id`, `a`.`title` AS `activity_title`, `a`.`type` AS `activity_type`, `a`.`description` AS `activity_description`, `l`.`id` AS `lesson_id`, `l`.`title` AS `lesson_title`, `u`.`id` AS `unit_id`, `u`.`title` AS `unit_title`, `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `g`.`id` AS `grade_id`, `g`.`name` AS `grade_name`, `ca`.`completed_file_path` AS `completed_file_path`, `ca`.`file_type` AS `file_type`, `ca`.`completion_data` AS `completion_data`, `ca`.`time_spent_seconds` AS `time_spent_seconds`, `ca`.`completed_at` AS `completed_at`, `ca`.`status` AS `status`, `ca`.`teacher_feedback` AS `teacher_feedback`, `ca`.`teacher_notes` AS `teacher_notes`, `ac`.`name` AS `assessment_criteria`, `ac`.`color` AS `criteria_color`, `u_assessor`.`first_name` AS `assessor_name`, `ca`.`assessed_at` AS `assessed_at` FROM ((((((((`completed_activities` `ca` join `children` `c` on((`ca`.`child_id` = `c`.`id`))) join `activities` `a` on((`ca`.`activity_id` = `a`.`id`))) left join `lessons` `l` on((`ca`.`lesson_id` = `l`.`id`))) left join `units` `u` on((`ca`.`unit_id` = `u`.`id`))) left join `books` `b` on((`ca`.`book_id` = `b`.`id`))) left join `grades` `g` on((`ca`.`grade_id` = `g`.`id`))) left join `assessment_criteria` `ac` on((`ca`.`assessment_criteria_id` = `ac`.`id`))) left join `users` `u_assessor` on((`ca`.`assessed_by` = `u_assessor`.`id`))) WHERE (`ca`.`status` in ('submitted','assessed')) ORDER BY `ca`.`completed_at` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `student_books`
--
DROP TABLE IF EXISTS `student_books`;

DROP VIEW IF EXISTS `student_books`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_books`  AS SELECT `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `b`.`description` AS `book_description`, `g`.`name` AS `grade_name`, `se`.`student_id` AS `student_id` FROM ((`books` `b` join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) join `student_enrollments` `se` on((`g`.`id` = `se`.`grade_id`))) WHERE ((`se`.`is_active` = 1) AND (`b`.`is_active` = 1)) ;

-- --------------------------------------------------------

--
-- Structure for view `student_enrolled_content`
--
DROP TABLE IF EXISTS `student_enrolled_content`;

DROP VIEW IF EXISTS `student_enrolled_content`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `student_enrolled_content`  AS SELECT `c`.`id` AS `student_id`, `c`.`first_name` AS `first_name`, `c`.`username` AS `username`, `sbe`.`book_id` AS `book_id`, `b`.`title` AS `book_title`, `g`.`name` AS `grade_name`, `sue`.`unit_id` AS `unit_id`, `u`.`title` AS `unit_title`, `sle`.`lesson_id` AS `lesson_id`, `l`.`title` AS `lesson_title`, `l`.`lesson_number` AS `lesson_number`, `u`.`unit_number` AS `unit_number` FROM (((((((`children` `c` left join `student_book_enrollments` `sbe` on(((`c`.`id` = `sbe`.`student_id`) and (`sbe`.`is_active` = 1)))) left join `books` `b` on((`sbe`.`book_id` = `b`.`id`))) left join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) left join `student_unit_enrollments` `sue` on(((`c`.`id` = `sue`.`student_id`) and (`sue`.`is_active` = 1)))) left join `units` `u` on((`sue`.`unit_id` = `u`.`id`))) left join `student_lesson_enrollments` `sle` on(((`c`.`id` = `sle`.`student_id`) and (`sle`.`is_active` = 1)))) left join `lessons` `l` on((`sle`.`lesson_id` = `l`.`id`))) WHERE (`c`.`is_active` = 1) ;

-- --------------------------------------------------------

--
-- Structure for view `teacher_assessment_summary`
--
DROP TABLE IF EXISTS `teacher_assessment_summary`;

DROP VIEW IF EXISTS `teacher_assessment_summary`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `teacher_assessment_summary`  AS SELECT `u_assessor`.`id` AS `teacher_id`, `u_assessor`.`first_name` AS `teacher_name`, count(`ca`.`id`) AS `total_submissions`, count((case when (`ca`.`status` = 'submitted') then 1 end)) AS `pending_assessments`, count((case when (`ca`.`status` = 'assessed') then 1 end)) AS `completed_assessments`, count((case when (`ca`.`assessment_criteria_id` = 1) then 1 end)) AS `emerging_count`, count((case when (`ca`.`assessment_criteria_id` = 2) then 1 end)) AS `developing_count`, count((case when (`ca`.`assessment_criteria_id` = 3) then 1 end)) AS `proficient_count`, count((case when (`ca`.`assessment_criteria_id` = 4) then 1 end)) AS `advanced_count`, avg(`ca`.`time_spent_seconds`) AS `avg_time_spent`, min(`ca`.`assessed_at`) AS `first_assessment`, max(`ca`.`assessed_at`) AS `last_assessment` FROM (`completed_activities` `ca` left join `users` `u_assessor` on((`ca`.`assessed_by` = `u_assessor`.`id`))) WHERE (`ca`.`status` = 'assessed') GROUP BY `u_assessor`.`id`, `u_assessor`.`first_name` ;

-- --------------------------------------------------------

--
-- Structure for view `teacher_book_summary`
--
DROP TABLE IF EXISTS `teacher_book_summary`;

DROP VIEW IF EXISTS `teacher_book_summary`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `teacher_book_summary`  AS SELECT `tba`.`teacher_id` AS `teacher_id`, `tba`.`book_id` AS `book_id`, `b`.`title` AS `book_title`, `b`.`description` AS `book_description`, `g`.`name` AS `grade_name`, `g`.`id` AS `grade_id`, count(distinct `sbe`.`student_id`) AS `enrolled_students`, count(distinct `u`.`id`) AS `total_units`, count(distinct (case when (`u`.`is_unlocked` = 1) then `u`.`id` end)) AS `unlocked_units`, count(distinct `l`.`id`) AS `total_lessons`, count(distinct (case when (`l`.`is_unlocked` = 1) then `l`.`id` end)) AS `unlocked_lessons` FROM (((((`teacher_book_assignments` `tba` left join `books` `b` on((`tba`.`book_id` = `b`.`id`))) left join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) left join `student_book_enrollments` `sbe` on(((`b`.`id` = `sbe`.`book_id`) and (`sbe`.`is_active` = 1)))) left join `units` `u` on((`b`.`id` = `u`.`book_id`))) left join `lessons` `l` on((`u`.`id` = `l`.`unit_id`))) WHERE ((`tba`.`is_active` = 1) AND (`b`.`is_active` = 1)) GROUP BY `tba`.`teacher_id`, `tba`.`book_id` ;

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
  ADD CONSTRAINT `child_progress_ibfk_7` FOREIGN KEY (`assessed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `child_progress_ibfk_8` FOREIGN KEY (`assessment_criteria_id`) REFERENCES `assessment_criteria` (`id`),
  ADD CONSTRAINT `child_progress_ibfk_9` FOREIGN KEY (`assessed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `completed_activities`
--
ALTER TABLE `completed_activities`
  ADD CONSTRAINT `completed_activities_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `completed_activities_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`),
  ADD CONSTRAINT `completed_activities_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  ADD CONSTRAINT `completed_activities_ibfk_4` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `completed_activities_ibfk_5` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`),
  ADD CONSTRAINT `completed_activities_ibfk_6` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `completed_activities_ibfk_7` FOREIGN KEY (`assessed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `completed_activities_ibfk_8` FOREIGN KEY (`assessment_criteria_id`) REFERENCES `assessment_criteria` (`id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`unlocked_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `student_book_enrollments`
--
ALTER TABLE `student_book_enrollments`
  ADD CONSTRAINT `student_book_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_book_enrollments_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_book_enrollments_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  ADD CONSTRAINT `student_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`),
  ADD CONSTRAINT `student_enrollments_ibfk_2` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`);

--
-- Constraints for table `student_lesson_enrollments`
--
ALTER TABLE `student_lesson_enrollments`
  ADD CONSTRAINT `student_lesson_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_lesson_enrollments_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_lesson_enrollments_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `student_unit_enrollments`
--
ALTER TABLE `student_unit_enrollments`
  ADD CONSTRAINT `student_unit_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_unit_enrollments_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_unit_enrollments_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `teacher_book_assignments`
--
ALTER TABLE `teacher_book_assignments`
  ADD CONSTRAINT `teacher_book_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_book_assignments_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `unit_completions_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
