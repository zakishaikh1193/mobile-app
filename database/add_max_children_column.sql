-- Add max_children column to users table for parent accounts
ALTER TABLE `users` 
ADD COLUMN `max_children` INT DEFAULT 3 COMMENT 'Maximum number of children this parent can create';

-- Set default value for existing parent accounts
UPDATE `users` SET `max_children` = 3 WHERE `role` = 'parent';

-- Drop any existing license-related columns if they exist
ALTER TABLE `users`
DROP COLUMN IF EXISTS `license_type`,
DROP COLUMN IF EXISTS `license_expires_at`,
DROP COLUMN IF EXISTS `created_by_admin`;
