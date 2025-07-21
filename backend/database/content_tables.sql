USE prek_db;

-- Files table first (without foreign key)
CREATE TABLE IF NOT EXISTS files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'video', 'pdf', 'html') NOT NULL,
    file_size INT NOT NULL,  -- in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- Math, English, etc.
    description TEXT,
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    thumbnail_id INT NULL
);

-- Add foreign key constraints after both tables are created
ALTER TABLE content ADD CONSTRAINT fk_content_thumbnail FOREIGN KEY (thumbnail_id) REFERENCES files(id);
ALTER TABLE files ADD CONSTRAINT fk_files_content FOREIGN KEY (content_id) REFERENCES content(id);

-- Create indexes for better performance
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_files_content_id ON files(content_id);
CREATE INDEX idx_files_type ON files(file_type);
CREATE INDEX idx_content_thumbnail ON content(thumbnail_id);
