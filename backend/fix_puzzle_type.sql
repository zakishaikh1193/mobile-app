-- Fix the activities table to include 'puzzle' as a valid type
ALTER TABLE `activities` 
MODIFY COLUMN `type` enum('coloring','letter_match','bubble_pop','counting','emotion_match','family_tree','digital_painting','forest_hunt','puzzle') NOT NULL;

