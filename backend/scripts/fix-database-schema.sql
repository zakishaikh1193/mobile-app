-- Drop the problematic function and trigger that reference non-existent columns
DROP TRIGGER IF EXISTS create_parent_license;
DROP FUNCTION IF EXISTS can_create_child;

-- Ensure the users table has the correct structure for our simplified license logic
-- The max_children column already exists in the schema, so we just need to make sure it's set correctly

-- Update any existing parent users to have a default max_children if they don't have one
UPDATE users SET max_children = 3 WHERE role = 'parent' AND (max_children IS NULL OR max_children = 0);

-- Set max_children to 0 for non-parent users
UPDATE users SET max_children = 0 WHERE role != 'parent';
