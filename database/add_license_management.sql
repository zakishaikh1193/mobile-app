-- License Management Schema Updates
-- Run these SQL commands to add license management functionality

-- 1. Add license columns to users table for parents
ALTER TABLE `users` 
ADD COLUMN `max_children` INT DEFAULT 0 COMMENT 'Maximum number of children this parent can create',
ADD COLUMN `license_type` VARCHAR(50) DEFAULT 'free' COMMENT 'License type: free, basic, premium, enterprise',
ADD COLUMN `license_expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'License expiration date',
ADD COLUMN `created_by_admin` TINYINT(1) DEFAULT 0 COMMENT 'Whether this account was created by admin';

-- 2. Create parent_licenses table for detailed license tracking
CREATE TABLE IF NOT EXISTS `parent_licenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL,
  `license_type` varchar(50) NOT NULL DEFAULT 'free',
  `max_children` int NOT NULL DEFAULT 1,
  `issued_by` int NOT NULL COMMENT 'Admin user ID who issued the license',
  `issued_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `issued_by` (`issued_by`),
  FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Create license_types reference table
CREATE TABLE IF NOT EXISTS `license_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `max_children` int NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `duration_months` int DEFAULT NULL COMMENT 'NULL means unlimited',
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Insert default license types
INSERT INTO `license_types` (`name`, `display_name`, `max_children`, `price`, `duration_months`, `features`) VALUES
('free', 'Free', 1, 0.00, NULL, '{"features": ["1 child profile", "Basic activities", "Limited progress tracking"]}'),
('basic', 'Basic', 3, 9.99, 12, '{"features": ["Up to 3 children", "All activities", "Progress tracking", "Email support"]}'),
('premium', 'Premium', 5, 19.99, 12, '{"features": ["Up to 5 children", "All activities", "Advanced analytics", "Priority support", "Custom avatars"]}'),
('enterprise', 'Enterprise', 50, 99.99, 12, '{"features": ["Up to 50 children", "All features", "Admin dashboard", "API access", "Dedicated support"]}');

-- 5. Add trigger to automatically create license record when parent is created
DELIMITER //
CREATE TRIGGER `create_parent_license` AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    IF NEW.role = 'parent' AND NEW.max_children > 0 THEN
        INSERT INTO `parent_licenses` (`parent_id`, `license_type`, `max_children`, `issued_by`)
        VALUES (NEW.id, NEW.license_type, NEW.max_children, NEW.created_by_admin);
    END IF;
END//
DELIMITER ;

-- 6. Create function to check if parent can create more children
DELIMITER //
CREATE FUNCTION `can_create_child`(parent_id INT) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE current_children INT DEFAULT 0;
    DECLARE max_allowed INT DEFAULT 0;
    DECLARE license_active BOOLEAN DEFAULT FALSE;
    
    -- Get current number of active children
    SELECT COUNT(*) INTO current_children 
    FROM children 
    WHERE parent_id = parent_id AND is_active = 1;
    
    -- Get license info
    SELECT u.max_children, 
           (u.license_expires_at IS NULL OR u.license_expires_at > NOW()) 
    INTO max_allowed, license_active
    FROM users u 
    WHERE u.id = parent_id AND u.role = 'parent';
    
    -- Return true if can create more children
    RETURN (license_active AND current_children < max_allowed);
END//
DELIMITER ;

-- 7. Add indexes for performance
CREATE INDEX `idx_users_license_type` ON `users`(`license_type`);
CREATE INDEX `idx_users_license_expires` ON `users`(`license_expires_at`);
CREATE INDEX `idx_parent_licenses_active` ON `parent_licenses`(`is_active`);
CREATE INDEX `idx_parent_licenses_expires` ON `parent_licenses`(`expires_at`);
