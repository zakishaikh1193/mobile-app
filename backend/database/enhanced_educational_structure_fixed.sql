-- Enhanced Educational Structure Database Schema (FIXED VERSION)
-- This implements the complete hierarchy: Grade -> Subject -> Book -> Chapter -> Topic -> Activity
-- Admin manually releases chapters, previous completion unlocks next topic within same chapter

-- ============================================
-- 1. CONVERT EXISTING TABLES TO InnoDB
-- ============================================

-- Convert activities table to InnoDB to support foreign keys
ALTER TABLE activities ENGINE = InnoDB;

-- ============================================
-- 2. ENHANCED EDUCATIONAL HIERARCHY
-- ============================================

    -- Books table (new addition)
    CREATE TABLE IF NOT EXISTS books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subject_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        order_number INT NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        academic_year VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        UNIQUE KEY unique_subject_book (subject_id, title, academic_year)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Chapters table (new addition)
CREATE TABLE IF NOT EXISTS chapters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    chapter_number INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_released BOOLEAN DEFAULT FALSE, -- Admin controls chapter release
    release_date DATE NULL, -- When admin releases this chapter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    UNIQUE KEY unique_book_chapter (book_id, chapter_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Update topics table to link with chapters instead of lessons
ALTER TABLE topics 
ADD COLUMN chapter_id INT,
ADD COLUMN order_number INT DEFAULT 0, -- For topic ordering within chapter
ADD COLUMN is_unlocked BOOLEAN DEFAULT FALSE, -- Unlocked by previous topic completion
ADD COLUMN unlock_requirement INT DEFAULT 0; -- How many previous topics need completion

-- Add foreign key after adding the column
ALTER TABLE topics ADD FOREIGN KEY (chapter_id) REFERENCES chapters(id);

-- Add academic_year to existing tables
ALTER TABLE grades ADD COLUMN academic_year VARCHAR(20) DEFAULT '2024-2025';
ALTER TABLE subjects ADD COLUMN academic_year VARCHAR(20) DEFAULT '2024-2025';

-- ============================================
-- 3. ENHANCED ACTIVITY SYSTEM
-- ============================================

-- Update activities table to include more metadata
ALTER TABLE activities 
ADD COLUMN chapter_id INT,
ADD COLUMN book_id INT,
ADD COLUMN subject_id INT,
ADD COLUMN grade_id INT,
ADD COLUMN estimated_duration INT DEFAULT 10, -- in minutes
ADD COLUMN max_attempts INT DEFAULT 3,
ADD COLUMN passing_score INT DEFAULT 70,
ADD COLUMN is_adaptive BOOLEAN DEFAULT FALSE,
ADD COLUMN adaptive_rules JSON;

-- Add foreign keys after adding the columns
ALTER TABLE activities 
ADD FOREIGN KEY (chapter_id) REFERENCES chapters(id),
ADD FOREIGN KEY (book_id) REFERENCES books(id),
ADD FOREIGN KEY (subject_id) REFERENCES subjects(id),
ADD FOREIGN KEY (grade_id) REFERENCES grades(id);

-- Activity prerequisites table (for activities within same topic)
CREATE TABLE IF NOT EXISTS activity_prerequisites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    prerequisite_activity_id INT NOT NULL,
    minimum_score INT DEFAULT 70,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (prerequisite_activity_id) REFERENCES activities(id),
    UNIQUE KEY unique_prerequisite (activity_id, prerequisite_activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================
-- 4. ENHANCED PROGRESS TRACKING
-- ============================================

-- Enhanced child_progress table
ALTER TABLE child_progress 
ADD COLUMN chapter_id INT,
ADD COLUMN book_id INT,
ADD COLUMN subject_id INT,
ADD COLUMN grade_id INT,
ADD COLUMN score INT DEFAULT 0,
ADD COLUMN time_spent INT DEFAULT 0, -- in seconds
ADD COLUMN attempts_count INT DEFAULT 0,
ADD COLUMN last_attempt_at TIMESTAMP NULL,
ADD COLUMN teacher_feedback TEXT,
ADD COLUMN teacher_score INT DEFAULT NULL,
ADD COLUMN is_assessed BOOLEAN DEFAULT FALSE,
ADD COLUMN assessed_by INT DEFAULT NULL,
ADD COLUMN assessed_at TIMESTAMP NULL;

-- Add foreign keys after adding the columns
ALTER TABLE child_progress 
ADD FOREIGN KEY (chapter_id) REFERENCES chapters(id),
ADD FOREIGN KEY (book_id) REFERENCES books(id),
ADD FOREIGN KEY (subject_id) REFERENCES subjects(id),
ADD FOREIGN KEY (grade_id) REFERENCES grades(id),
ADD FOREIGN KEY (assessed_by) REFERENCES users(id);

-- Topic completion tracking (for unlocking next topics)
CREATE TABLE IF NOT EXISTS topic_completions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    topic_id INT NOT NULL,
    chapter_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_score DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (child_id) REFERENCES children(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    UNIQUE KEY unique_child_topic_completion (child_id, topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Activity completion certificates
CREATE TABLE IF NOT EXISTS activity_certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    activity_id INT NOT NULL,
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    UNIQUE KEY unique_child_activity_certificate (child_id, activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================
-- 5. TEACHER ASSESSMENT SYSTEM
-- ============================================

-- Teacher assessments table
CREATE TABLE IF NOT EXISTS teacher_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    activity_id INT NOT NULL,
    teacher_id INT NOT NULL,
    score INT NOT NULL,
    feedback TEXT,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assessment_type ENUM('initial', 'reassessment', 'final') DEFAULT 'initial',
    FOREIGN KEY (child_id) REFERENCES children(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    UNIQUE KEY unique_assessment (child_id, activity_id, teacher_id, assessment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Assessment criteria table
CREATE TABLE IF NOT EXISTS assessment_criteria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    criteria_name VARCHAR(255) NOT NULL,
    criteria_description TEXT,
    max_score INT DEFAULT 10,
    weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================
-- 6. ACCESS CONTROL (Simplified - No Licensing)
-- ============================================

-- Content access control table (for admin-managed access)
CREATE TABLE IF NOT EXISTS content_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content_type ENUM('grade', 'subject', 'book', 'chapter', 'topic', 'activity') NOT NULL,
    content_id INT NOT NULL,
    access_level ENUM('view', 'edit', 'admin') DEFAULT 'view',
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (granted_by) REFERENCES users(id),
    UNIQUE KEY unique_user_content_access (user_id, content_type, content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Chapter release schedule (admin controlled)
CREATE TABLE IF NOT EXISTS chapter_releases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    release_date DATE NOT NULL,
    released_by INT NOT NULL,
    release_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    FOREIGN KEY (released_by) REFERENCES users(id),
    UNIQUE KEY unique_chapter_release (chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================
-- 7. ACADEMIC YEAR MANAGEMENT
-- ============================================

-- Academic years table
CREATE TABLE IF NOT EXISTS academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Academic year assignments
CREATE TABLE IF NOT EXISTS academic_year_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    role ENUM('student', 'teacher', 'parent') NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE KEY unique_user_academic_year (user_id, academic_year_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================
-- 8. PROGRESS ANALYTICS
-- ============================================

-- Learning analytics table
CREATE TABLE IF NOT EXISTS learning_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    subject_id INT NOT NULL,
    book_id INT NOT NULL,
    chapter_id INT NOT NULL,
    topic_id INT NOT NULL,
    total_activities INT DEFAULT 0,
    completed_activities INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    total_time_spent INT DEFAULT 0, -- in minutes
    last_activity_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    UNIQUE KEY unique_child_topic_analytics (child_id, subject_id, book_id, chapter_id, topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ============================================
-- 9. SAMPLE DATA INSERTION
-- ============================================

-- Insert sample academic year
INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES 
('2024-2025', '2024-09-01', '2025-06-30', TRUE);

-- Insert sample grades
INSERT INTO grades (name, description, academic_year) VALUES 
('Grade 1', 'First grade students', '2024-2025'),
('Grade 2', 'Second grade students', '2024-2025'),
('Grade 3', 'Third grade students', '2024-2025');

-- Insert sample subjects for Grade 1
INSERT INTO subjects (grade_id, name, description, academic_year) VALUES 
(1, 'Mathematics', 'Basic math concepts and operations', '2024-2025'),
(1, 'English', 'Language arts and reading', '2024-2025'),
(1, 'Science', 'Basic science concepts', '2024-2025');

-- Insert sample books
INSERT INTO books (subject_id, title, description, order_number, academic_year) VALUES 
(1, 'Math Book 1', 'Introduction to numbers and basic operations', 1, '2024-2025'),
(2, 'English Reader 1', 'Basic reading and writing skills', 1, '2024-2025'),
(3, 'Science Explorer 1', 'Introduction to scientific concepts', 1, '2024-2025');

-- Insert sample chapters (only first chapter released initially)
INSERT INTO chapters (book_id, title, description, chapter_number, is_released, release_date) VALUES 
(1, 'Numbers 1-10', 'Learning to count and recognize numbers', 1, TRUE, '2024-09-01'),
(1, 'Addition', 'Basic addition concepts', 2, FALSE, NULL),
(1, 'Subtraction', 'Basic subtraction concepts', 3, FALSE, NULL),
(2, 'Alphabet', 'Learning the alphabet', 1, TRUE, '2024-09-01'),
(2, 'Simple Words', 'Reading simple words', 2, FALSE, NULL),
(3, 'Living Things', 'Introduction to living organisms', 1, TRUE, '2024-09-01');

-- Insert sample topics (first topic unlocked, others require completion)
INSERT INTO topics (chapter_id, title, description, order_number, is_unlocked, unlock_requirement) VALUES 
(1, 'Counting Numbers', 'Learn to count from 1 to 10', 1, TRUE, 0),
(1, 'Number Recognition', 'Recognize written numbers', 2, FALSE, 1),
(1, 'Number Writing', 'Write numbers 1-10', 3, FALSE, 2),
(2, 'Adding Numbers', 'Learn to add numbers', 1, FALSE, 0), -- Locked until chapter 2 is released
(2, 'Addition Stories', 'Solve addition word problems', 2, FALSE, 1),
(4, 'Letter A', 'Learn the letter A and its sound', 1, TRUE, 0),
(4, 'Letter B', 'Learn the letter B and its sound', 2, FALSE, 1),
(4, 'Letter C', 'Learn the letter C and its sound', 3, FALSE, 2);

-- Update existing activities to link with new structure
UPDATE activities SET 
    topic_id = 1,
    chapter_id = 1,
    book_id = 1,
    subject_id = 1,
    grade_id = 1
WHERE id = 1;

-- ============================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================

-- Add indexes for better query performance
CREATE INDEX idx_activities_hierarchy ON activities(grade_id, subject_id, book_id, chapter_id, topic_id);
CREATE INDEX idx_child_progress_hierarchy ON child_progress(grade_id, subject_id, book_id, chapter_id);
CREATE INDEX idx_content_access_user ON content_access(user_id, content_type, is_active);
CREATE INDEX idx_learning_analytics_child ON learning_analytics(child_id, subject_id, book_id, chapter_id, topic_id);
CREATE INDEX idx_teacher_assessments_child ON teacher_assessments(child_id, activity_id);
CREATE INDEX idx_academic_year_assignments_user ON academic_year_assignments(user_id, academic_year_id);
CREATE INDEX idx_chapters_release ON chapters(is_released, release_date);
CREATE INDEX idx_topics_unlock ON topics(chapter_id, order_number, is_unlocked);

-- ============================================
-- 11. VIEWS FOR COMMON QUERIES
-- ============================================

-- View for child's complete progress
CREATE VIEW child_complete_progress AS
SELECT 
    cp.child_id,
    c.first_name,
    c.last_name,
    g.name as grade_name,
    s.name as subject_name,
    b.title as book_title,
    ch.title as chapter_title,
    t.title as topic_title,
    a.title as activity_title,
    cp.progress_value,
    cp.score,
    cp.completed,
    cp.completed_at,
    cp.teacher_feedback,
    cp.teacher_score
FROM child_progress cp
JOIN children c ON cp.child_id = c.id
JOIN grades g ON cp.grade_id = g.id
JOIN subjects s ON cp.subject_id = s.id
JOIN books b ON cp.book_id = b.id
JOIN chapters ch ON cp.chapter_id = ch.id
JOIN topics t ON cp.topic_id = t.id
JOIN activities a ON cp.activity_id = a.id;

-- View for available topics (considering chapter release and topic completion)
CREATE VIEW available_topics AS
SELECT 
    t.id as topic_id,
    t.title as topic_title,
    t.chapter_id,
    ch.title as chapter_title,
    ch.is_released,
    t.is_unlocked,
    t.unlock_requirement,
    tc.child_id,
    COUNT(tc2.id) as completed_previous_topics
FROM topics t
JOIN chapters ch ON t.chapter_id = ch.id
LEFT JOIN topic_completions tc ON t.chapter_id = tc.chapter_id
LEFT JOIN topic_completions tc2 ON tc2.chapter_id = t.chapter_id 
    AND tc2.child_id = tc.child_id 
    AND tc2.topic_id IN (
        SELECT id FROM topics 
        WHERE chapter_id = t.chapter_id 
        AND order_number < t.order_number
    )
WHERE ch.is_released = TRUE
GROUP BY t.id, tc.child_id;

-- View for teacher dashboard
CREATE VIEW teacher_dashboard_data AS
SELECT 
    tca.teacher_id,
    u.first_name,
    u.last_name,
    g.name as grade_name,
    s.name as subject_name,
    COUNT(DISTINCT se.student_id) as total_students,
    COUNT(DISTINCT cp.child_id) as active_students,
    AVG(cp.progress_value) as average_progress
FROM teacher_class_assignments tca
JOIN users u ON tca.teacher_id = u.id
JOIN grades g ON tca.grade_id = g.id
JOIN subjects s ON tca.subject_id = s.id
LEFT JOIN student_enrollments se ON tca.grade_id = se.grade_id
LEFT JOIN child_progress cp ON se.student_id = cp.child_id
WHERE tca.academic_year = '2024-2025'
GROUP BY tca.teacher_id, tca.grade_id, tca.subject_id; 