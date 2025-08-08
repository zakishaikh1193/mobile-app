-- =====================================================
-- TEACHER ASSESSMENT SYSTEM CHANGES
-- =====================================================
-- This file contains all changes needed to implement
-- teacher assessment of children's completed activities
-- =====================================================

-- =====================================================
-- 1. REMOVE PERCENTAGE-BASED SCORING FROM ACTIVITIES
-- =====================================================

-- Remove passing_score and max_attempts from activities table
ALTER TABLE activities 
DROP COLUMN passing_score,
DROP COLUMN max_attempts;

-- =====================================================
-- 2. CREATE ASSESSMENT CRITERIA TABLE
-- =====================================================

CREATE TABLE assessment_criteria (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  level_order INT NOT NULL DEFAULT 1,
  color VARCHAR(7) DEFAULT '#000000',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_criteria_name (name),
  KEY idx_criteria_active (is_active),
  KEY idx_criteria_order (level_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Insert the 4 assessment criteria
INSERT INTO assessment_criteria (name, description, level_order, color) VALUES
('Emerging', 'Student is beginning to understand and demonstrate the skill', 1, '#FF6B6B'),
('Developing', 'Student shows some understanding but needs more practice', 2, '#FFA500'),
('Proficient', 'Student demonstrates good understanding of the skill', 3, '#4ECDC4'),
('Advanced', 'Student demonstrates excellent mastery of the skill', 4, '#45B7D1');

-- =====================================================
-- 3. CREATE COMPLETED ACTIVITIES TABLE
-- =====================================================

CREATE TABLE completed_activities (
  id INT NOT NULL AUTO_INCREMENT,
  child_id INT NOT NULL,
  activity_id INT NOT NULL,
  lesson_id INT DEFAULT NULL,
  unit_id INT DEFAULT NULL,
  book_id INT DEFAULT NULL,
  grade_id INT DEFAULT NULL,
  
  -- File storage
  completed_file_path VARCHAR(500) NOT NULL,
  file_type ENUM('image', 'video', 'audio', 'document') DEFAULT 'image',
  file_size INT DEFAULT NULL,
  
  -- Activity completion data
  completion_data JSON DEFAULT NULL, -- Store any additional data (colors used, time spent, etc.)
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  status ENUM('submitted', 'assessed', 'returned') DEFAULT 'submitted',
  
  -- Teacher assessment
  assessed_by INT DEFAULT NULL,
  assessed_at TIMESTAMP NULL DEFAULT NULL,
  assessment_criteria_id INT DEFAULT NULL,
  teacher_feedback TEXT,
  teacher_notes TEXT,
  
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  UNIQUE KEY unique_child_activity_completion (child_id, activity_id),
  KEY idx_completed_activities_child (child_id),
  KEY idx_completed_activities_activity (activity_id),
  KEY idx_completed_activities_lesson (lesson_id),
  KEY idx_completed_activities_unit (unit_id),
  KEY idx_completed_activities_book (book_id),
  KEY idx_completed_activities_grade (grade_id),
  KEY idx_completed_activities_status (status),
  KEY idx_completed_activities_assessed_by (assessed_by),
  KEY idx_completed_activities_criteria (assessment_criteria_id),
  KEY idx_completed_activities_submitted (completed_at),
  KEY idx_completed_activities_assessed (assessed_at),
  
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (grade_id) REFERENCES grades(id),
  FOREIGN KEY (assessed_by) REFERENCES users(id),
  FOREIGN KEY (assessment_criteria_id) REFERENCES assessment_criteria(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- =====================================================
-- 4. MODIFY CHILD_PROGRESS TABLE FOR ASSESSMENT
-- =====================================================

-- Remove percentage-based fields
ALTER TABLE child_progress 
DROP COLUMN score,
DROP COLUMN passing_score,
DROP COLUMN teacher_score;

-- Add assessment-related fields
ALTER TABLE child_progress 
ADD COLUMN assessment_criteria_id INT DEFAULT NULL AFTER completed,
ADD COLUMN teacher_feedback TEXT AFTER assessment_criteria_id,
ADD COLUMN teacher_notes TEXT AFTER teacher_feedback,
ADD COLUMN assessed_by INT DEFAULT NULL AFTER teacher_notes,
ADD COLUMN assessed_at TIMESTAMP NULL DEFAULT NULL AFTER assessed_by,
ADD COLUMN completion_file_path VARCHAR(500) DEFAULT NULL AFTER assessed_at,
ADD COLUMN completion_data JSON DEFAULT NULL AFTER completion_file_path,
ADD COLUMN time_spent_seconds INT DEFAULT 0 AFTER completion_data,
ADD COLUMN status ENUM('in_progress', 'completed', 'assessed', 'returned') DEFAULT 'in_progress' AFTER time_spent_seconds,
ADD FOREIGN KEY (assessment_criteria_id) REFERENCES assessment_criteria(id),
ADD FOREIGN KEY (assessed_by) REFERENCES users(id),
ADD KEY idx_child_progress_assessment (assessment_criteria_id),
ADD KEY idx_child_progress_status (status),
ADD KEY idx_child_progress_assessed (assessed_at);

-- =====================================================
-- 5. CREATE VIEWS FOR TEACHER ASSESSMENT DASHBOARD
-- =====================================================

-- View for pending assessments
CREATE VIEW pending_assessments AS
SELECT 
  ca.id as completion_id,
  c.id as child_id,
  c.first_name as child_name,
  c.username as child_username,
  c.avatar as child_avatar,
  a.id as activity_id,
  a.title as activity_title,
  a.type as activity_type,
  a.description as activity_description,
  l.id as lesson_id,
  l.title as lesson_title,
  u.id as unit_id,
  u.title as unit_title,
  b.id as book_id,
  b.title as book_title,
  g.id as grade_id,
  g.name as grade_name,
  ca.completed_file_path,
  ca.file_type,
  ca.completion_data,
  ca.time_spent_seconds,
  ca.completed_at,
  ca.status,
  ca.teacher_feedback,
  ca.teacher_notes,
  ac.name as assessment_criteria,
  ac.color as criteria_color,
  u_assessor.first_name as assessor_name,
  ca.assessed_at
FROM completed_activities ca
JOIN children c ON ca.child_id = c.id
JOIN activities a ON ca.activity_id = a.id
LEFT JOIN lessons l ON ca.lesson_id = l.id
LEFT JOIN units u ON ca.unit_id = u.id
LEFT JOIN books b ON ca.book_id = b.id
LEFT JOIN grades g ON ca.grade_id = g.id
LEFT JOIN assessment_criteria ac ON ca.assessment_criteria_id = ac.id
LEFT JOIN users u_assessor ON ca.assessed_by = u_assessor.id
WHERE ca.status IN ('submitted', 'assessed')
ORDER BY ca.completed_at DESC;

-- View for assessment summary by teacher
CREATE VIEW teacher_assessment_summary AS
SELECT 
  u_assessor.id as teacher_id,
  u_assessor.first_name as teacher_name,
  COUNT(ca.id) as total_submissions,
  COUNT(CASE WHEN ca.status = 'submitted' THEN 1 END) as pending_assessments,
  COUNT(CASE WHEN ca.status = 'assessed' THEN 1 END) as completed_assessments,
  COUNT(CASE WHEN ca.assessment_criteria_id = 1 THEN 1 END) as emerging_count,
  COUNT(CASE WHEN ca.assessment_criteria_id = 2 THEN 1 END) as developing_count,
  COUNT(CASE WHEN ca.assessment_criteria_id = 3 THEN 1 END) as proficient_count,
  COUNT(CASE WHEN ca.assessment_criteria_id = 4 THEN 1 END) as advanced_count,
  AVG(ca.time_spent_seconds) as avg_time_spent,
  MIN(ca.assessed_at) as first_assessment,
  MAX(ca.assessed_at) as last_assessment
FROM completed_activities ca
LEFT JOIN users u_assessor ON ca.assessed_by = u_assessor.id
WHERE ca.status = 'assessed'
GROUP BY u_assessor.id, u_assessor.first_name;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for completed_activities table
CREATE INDEX idx_completed_activities_hierarchy ON completed_activities(grade_id, book_id, unit_id, lesson_id);
CREATE INDEX idx_completed_activities_type_status ON completed_activities(activity_id, status);
CREATE INDEX idx_completed_activities_child_status ON completed_activities(child_id, status);

-- Indexes for child_progress table
CREATE INDEX idx_child_progress_hierarchy_status ON child_progress(grade_id, book_id, unit_id, lesson_id, status);
CREATE INDEX idx_child_progress_child_status ON child_progress(child_id, status);

-- =====================================================
-- 7. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert a sample completed activity (you can remove this in production)
INSERT INTO completed_activities (
  child_id, 
  activity_id, 
  lesson_id, 
  unit_id, 
  book_id, 
  grade_id,
  completed_file_path,
  file_type,
  time_spent_seconds,
  status,
  completed_at
) VALUES (
  1, -- child_id (Zaki)
  4, -- activity_id (coloring activity)
  2, -- lesson_id (My Feelings)
  2, -- unit_id (All About Me)
  1, -- book_id (All About My Family)
  1, -- grade_id (Grade 1)
  'uploads/completed-activities/coloring-sample-1.png',
  'image',
  180, -- 3 minutes
  'submitted',
  NOW()
);

-- =====================================================
-- 8. CLEANUP OLD DATA (OPTIONAL)
-- =====================================================

-- Remove any existing percentage-based data from child_progress
UPDATE child_progress SET 
  score = NULL,
  passing_score = NULL,
  teacher_score = NULL
WHERE score IS NOT NULL OR passing_score IS NOT NULL OR teacher_score IS NOT NULL;

-- =====================================================
-- SUMMARY OF CHANGES
-- =====================================================
/*
1. ✅ Removed percentage-based scoring from activities table
2. ✅ Created assessment_criteria table with 4 levels
3. ✅ Created completed_activities table for storing completed work
4. ✅ Modified child_progress table for assessment tracking
5. ✅ Created views for teacher dashboard
6. ✅ Added performance indexes
7. ✅ Added sample data for testing

NEW TABLES:
- assessment_criteria (4 assessment levels)
- completed_activities (stores completed work files)

MODIFIED TABLES:
- activities (removed passing_score, max_attempts)
- child_progress (added assessment fields)

NEW VIEWS:
- pending_assessments (for teacher dashboard)
- teacher_assessment_summary (for analytics)

FILE STORAGE:
- Completed activities will be saved to: uploads/completed-activities/
- File paths stored in completed_activities.completed_file_path
- Supports: image, video, audio, document files
*/
