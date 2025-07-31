-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
ADD COLUMN first_name VARCHAR(50),
ADD COLUMN last_name VARCHAR(50),
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
MODIFY COLUMN email VARCHAR(100) UNIQUE,
MODIFY COLUMN username VARCHAR(50) UNIQUE;

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grade_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    UNIQUE KEY unique_grade_subject (grade_id, name)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Update activities table to link with topics
ALTER TABLE activities
ADD COLUMN topic_id INT,
ADD COLUMN created_by INT,
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN learning_objectives TEXT,
ADD COLUMN prerequisites TEXT,
ADD FOREIGN KEY (topic_id) REFERENCES topics(id),
ADD FOREIGN KEY (created_by) REFERENCES users(id);

-- Create teacher_class_assignments table
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    grade_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY unique_teacher_assignment (teacher_id, grade_id, subject_id, academic_year)
);

-- Create student_enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    grade_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    enrollment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    UNIQUE KEY unique_student_enrollment (student_id, grade_id, academic_year)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role, first_name, last_name, is_active)
VALUES (
    'admin', 
    'admin@school.edu', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin', 
    'System', 
    'Administrator', 
    TRUE
)
ON DUPLICATE KEY UPDATE 
    email = VALUES(email), 
    role = VALUES(role), 
    is_active = VALUES(is_active);