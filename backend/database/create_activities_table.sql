-- Create activities table for dynamic game content
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('coloring', 'letter_match', 'bubble_pop', 'counting', 'emotion_match', 'family_tree', 'digital_painting', 'forest_hunt') NOT NULL,
    description TEXT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    image_path VARCHAR(500),
    colors JSON, -- For coloring activities, stores available colors
    data JSON, -- For storing activity-specific data (questions, answers, etc.)
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_difficulty (difficulty)
);

-- Insert some sample coloring activities
INSERT INTO activities (title, type, description, difficulty, colors, data) VALUES 
(
    'Color the Butterfly', 
    'coloring', 
    'Use beautiful colors to paint this lovely butterfly!', 
    'easy',
    '["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"]',
    '{"areas": 6, "emoji": "🦋"}'
),
(
    'Color the Flower', 
    'coloring', 
    'Make this flower bloom with your favorite colors!', 
    'easy',
    '["#FF69B4", "#FFD700", "#32CD32", "#FF4500", "#9370DB", "#20B2AA"]',
    '{"areas": 6, "emoji": "🌸"}'
),
(
    'Color the Rainbow', 
    'coloring', 
    'Paint a beautiful rainbow with all the colors!', 
    'medium',
    '["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]',
    '{"areas": 7, "emoji": "🌈"}'
);
