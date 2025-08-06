-- Add Teacher-Book and Student Enrollment Tables
-- This file contains the necessary database changes for the teacher-book-student enrollment system

-- 1. Teacher-Book Assignments (Many-to-Many)
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
  KEY `idx_teacher_book_book` (`book_id`),
  CONSTRAINT `teacher_book_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_book_assignments_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 2. Student-Book Enrollments (Many-to-Many)
CREATE TABLE IF NOT EXISTS `student_book_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `book_id` int NOT NULL,
  `enrolled_by` int NOT NULL, -- Teacher who enrolled the student
  `academic_year` varchar(20) NOT NULL DEFAULT '2024-2025',
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_book` (`student_id`,`book_id`,`academic_year`),
  KEY `idx_student_book_student` (`student_id`),
  KEY `idx_student_book_book` (`book_id`),
  KEY `idx_student_book_enrolled_by` (`enrolled_by`),
  CONSTRAINT `student_book_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_book_enrollments_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_book_enrollments_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 3. Student-Unit Enrollments (Many-to-Many)
CREATE TABLE IF NOT EXISTS `student_unit_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `enrolled_by` int NOT NULL, -- Teacher who enrolled the student
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_unit` (`student_id`,`unit_id`),
  KEY `idx_student_unit_student` (`student_id`),
  KEY `idx_student_unit_unit` (`unit_id`),
  KEY `idx_student_unit_enrolled_by` (`enrolled_by`),
  CONSTRAINT `student_unit_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_unit_enrollments_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_unit_enrollments_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 4. Student-Lesson Enrollments (Many-to-Many)
CREATE TABLE IF NOT EXISTS `student_lesson_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `enrolled_by` int NOT NULL, -- Teacher who enrolled the student
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson` (`student_id`,`lesson_id`),
  KEY `idx_student_lesson_student` (`student_id`),
  KEY `idx_student_lesson_lesson` (`lesson_id`),
  KEY `idx_student_lesson_enrolled_by` (`enrolled_by`),
  CONSTRAINT `student_lesson_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_lesson_enrollments_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_lesson_enrollments_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 5. Update unit_completions table to include enrollment relationship
ALTER TABLE `unit_completions` 
ADD COLUMN `enrolled_by` int DEFAULT NULL AFTER `child_id`,
ADD COLUMN `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP AFTER `enrolled_by`,
ADD KEY `idx_unit_completions_enrolled_by` (`enrolled_by`),
ADD CONSTRAINT `unit_completions_ibfk_3` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`);

-- 6. Add indexes for better performance
ALTER TABLE `books` ADD INDEX `idx_books_active` (`is_active`);
ALTER TABLE `units` ADD INDEX `idx_units_active` (`is_active`);
ALTER TABLE `lessons` ADD INDEX `idx_lessons_active` (`is_active`);

-- 7. Add view for teacher's assigned books with student counts
CREATE OR REPLACE VIEW `teacher_book_summary` AS
SELECT 
    tba.teacher_id,
    tba.book_id,
    b.title as book_title,
    b.description as book_description,
    g.name as grade_name,
    g.id as grade_id,
    COUNT(DISTINCT sbe.student_id) as enrolled_students,
    COUNT(DISTINCT u.id) as total_units,
    COUNT(DISTINCT CASE WHEN u.is_unlocked = 1 THEN u.id END) as unlocked_units,
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT CASE WHEN l.is_unlocked = 1 THEN l.id END) as unlocked_lessons
FROM teacher_book_assignments tba
LEFT JOIN books b ON tba.book_id = b.id
LEFT JOIN grades g ON b.grade_id = g.id
LEFT JOIN student_book_enrollments sbe ON b.id = sbe.book_id AND sbe.is_active = 1
LEFT JOIN units u ON b.id = u.book_id
LEFT JOIN lessons l ON u.id = l.unit_id
WHERE tba.is_active = 1 AND b.is_active = 1
GROUP BY tba.teacher_id, tba.book_id;

-- 8. Add view for student's enrolled content
CREATE OR REPLACE VIEW `student_enrolled_content` AS
SELECT 
    c.id as student_id,
    c.first_name,
    c.username,
    sbe.book_id,
    b.title as book_title,
    g.name as grade_name,
    sue.unit_id,
    u.title as unit_title,
    sle.lesson_id,
    l.title as lesson_title,
    l.lesson_number,
    u.unit_number
FROM children c
LEFT JOIN student_book_enrollments sbe ON c.id = sbe.student_id AND sbe.is_active = 1
LEFT JOIN books b ON sbe.book_id = b.id
LEFT JOIN grades g ON b.grade_id = g.id
LEFT JOIN student_unit_enrollments sue ON c.id = sue.student_id AND sue.is_active = 1
LEFT JOIN units u ON sue.unit_id = u.id
LEFT JOIN student_lesson_enrollments sle ON c.id = sle.student_id AND sle.is_active = 1
LEFT JOIN lessons l ON sle.lesson_id = l.id
WHERE c.is_active = 1; 