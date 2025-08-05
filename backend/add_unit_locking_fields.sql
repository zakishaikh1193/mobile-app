-- Add unit locking fields to existing units table
-- Run this script to update the database schema

-- Add unit locking fields
ALTER TABLE `units` 
ADD COLUMN `is_unlocked` tinyint(1) DEFAULT '0' AFTER `is_active`,
ADD COLUMN `unlocked_by` int DEFAULT NULL AFTER `is_unlocked`,
ADD COLUMN `unlocked_at` timestamp NULL DEFAULT NULL AFTER `unlocked_by`;

-- Add index for unlocked_by
ALTER TABLE `units` 
ADD KEY `unlocked_by` (`unlocked_by`);

-- Add foreign key constraint for unlocked_by
ALTER TABLE `units`
ADD CONSTRAINT `units_ibfk_2` FOREIGN KEY (`unlocked_by`) REFERENCES `users` (`id`);

-- Update the letterpath_data view to include unit unlocking status
DROP VIEW IF EXISTS `letterpath_data`;
CREATE VIEW `letterpath_data` AS 
SELECT 
    `u`.`id` AS `unit_id`, 
    `u`.`title` AS `unit_title`, 
    `u`.`description` AS `unit_description`, 
    `u`.`unit_number` AS `level_number`, 
    `l`.`id` AS `lesson_id`, 
    `l`.`title` AS `lesson_title`, 
    `l`.`is_unlocked` AS `lesson_unlocked`, 
    `u`.`is_unlocked` AS `unit_unlocked`,
    `b`.`id` AS `book_id`, 
    `b`.`title` AS `book_title`, 
    `g`.`id` AS `grade_id`, 
    `g`.`name` AS `grade_name`, 
    count(`a`.`id`) AS `total_activities`, 
    count((case when (`cp`.`completed` = 1) then 1 end)) AS `completed_activities`, 
    `uc`.`completion_score` AS `completion_score`, 
    `uc`.`completed_at` AS `completed_at`, 
    (case when (`uc`.`completed_at` is not null) then 'completed' 
          when (`u`.`is_unlocked` = 1) then 'available' 
          else 'locked' end) AS `status` 
FROM ((((((`units` `u` join `lessons` `l` on((`u`.`lesson_id` = `l`.`id`))) 
         join `books` `b` on((`l`.`book_id` = `b`.`id`))) 
         join `grades` `g` on((`b`.`grade_id` = `g`.`id`))) 
         left join `activities` `a` on(((`u`.`id` = `a`.`unit_id`) and (`a`.`status` = 'active')))) 
         left join `child_progress` `cp` on((`a`.`id` = `cp`.`activity_id`))) 
         left join `unit_completions` `uc` on((`u`.`id` = `uc`.`unit_id`))) 
GROUP BY `u`.`id`, `uc`.`child_id`; 