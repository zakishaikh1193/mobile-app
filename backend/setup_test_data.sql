-- Setup Test Data for Teacher-Book Assignment System
-- Run this script to create test data for development

-- 1. Insert test grades
INSERT INTO grades (name, description, academic_year) VALUES 
('Pre-K', 'Pre-Kindergarten', '2024-2025'),
('Kindergarten', 'Kindergarten', '2024-2025'),
('Grade 1', 'First Grade', '2024-2025')
ON DUPLICATE KEY UPDATE name = name;

-- 2. Insert test books
INSERT INTO books (grade_id, title, description, order_number, is_active, academic_year) VALUES 
(1, 'Pre-K Math Book', 'Mathematics fundamentals for Pre-K students', 1, 1, '2024-2025'),
(1, 'Pre-K English Book', 'English language skills for Pre-K students', 2, 1, '2024-2025'),
(2, 'Kindergarten Math Book', 'Mathematics fundamentals for Kindergarten students', 1, 1, '2024-2025'),
(2, 'Kindergarten English Book', 'English language skills for Kindergarten students', 2, 1, '2024-2025')
ON DUPLICATE KEY UPDATE title = title;

-- 3. Insert test units
INSERT INTO units (book_id, title, description, unit_number, is_active) VALUES 
(1, 'Numbers 1-10', 'Learning to count from 1 to 10', 1, 1),
(1, 'Shapes', 'Learning basic shapes', 2, 1),
(2, 'Alphabet A-Z', 'Learning the alphabet', 1, 1),
(2, 'Colors', 'Learning basic colors', 2, 1),
(3, 'Addition', 'Basic addition skills', 1, 1),
(3, 'Subtraction', 'Basic subtraction skills', 2, 1),
(4, 'Reading', 'Basic reading skills', 1, 1),
(4, 'Writing', 'Basic writing skills', 2, 1)
ON DUPLICATE KEY UPDATE title = title;

-- 4. Insert test lessons
INSERT INTO lessons (unit_id, title, description, lesson_number, is_active) VALUES 
(1, 'Counting 1-5', 'Learn to count from 1 to 5', 1, 1),
(1, 'Counting 6-10', 'Learn to count from 6 to 10', 2, 1),
(2, 'Circle and Square', 'Learn about circles and squares', 1, 1),
(2, 'Triangle and Rectangle', 'Learn about triangles and rectangles', 2, 1),
(3, 'Letters A-M', 'Learn letters A through M', 1, 1),
(3, 'Letters N-Z', 'Learn letters N through Z', 2, 1),
(4, 'Red and Blue', 'Learn about red and blue colors', 1, 1),
(4, 'Green and Yellow', 'Learn about green and yellow colors', 2, 1)
ON DUPLICATE KEY UPDATE title = title;

-- 5. Insert test children (students)
INSERT INTO children (parent_id, first_name, username, email, password, age, gender, is_active) VALUES 
(1, 'Emma', 'emma_student', 'emma@child.local', 'not_used', 5, 'girl', 1),
(1, 'Liam', 'liam_student', 'liam@child.local', 'not_used', 6, 'boy', 1),
(1, 'Sophia', 'sophia_student', 'sophia@child.local', 'not_used', 4, 'girl', 1),
(1, 'Noah', 'noah_student', 'noah@child.local', 'not_used', 5, 'boy', 1)
ON DUPLICATE KEY UPDATE first_name = first_name;

-- 6. Assign books to teacher (assuming teacher ID is 9)
INSERT INTO teacher_book_assignments (teacher_id, book_id, academic_year, is_active) VALUES 
(9, 1, '2024-2025', 1),
(9, 2, '2024-2025', 1),
(9, 3, '2024-2025', 1),
(9, 4, '2024-2025', 1)
ON DUPLICATE KEY UPDATE is_active = 1;

-- 7. Unlock some units for testing
UPDATE units SET is_unlocked = 1 WHERE id IN (1, 2, 3, 4);

-- 8. Unlock some lessons for testing
UPDATE lessons SET is_unlocked = 1 WHERE id IN (1, 2, 3, 4);

-- Display the test data
SELECT 'Grades:' as info;
SELECT * FROM grades;

SELECT 'Books:' as info;
SELECT b.*, g.name as grade_name FROM books b LEFT JOIN grades g ON b.grade_id = g.id;

SELECT 'Units:' as info;
SELECT u.*, b.title as book_title FROM units u LEFT JOIN books b ON u.book_id = b.id;

SELECT 'Lessons:' as info;
SELECT l.*, u.title as unit_title FROM lessons l LEFT JOIN units u ON l.unit_id = u.id;

SELECT 'Children:' as info;
SELECT * FROM children;

SELECT 'Teacher Book Assignments:' as info;
SELECT tba.*, b.title as book_title, g.name as grade_name 
FROM teacher_book_assignments tba 
LEFT JOIN books b ON tba.book_id = b.id 
LEFT JOIN grades g ON b.grade_id = g.id; 