const db = require('../models/db');
const { validationResult } = require('express-validator');

// ============================================
// EDUCATIONAL HIERARCHY CONTROLLERS
// ============================================

// @desc    Get complete educational hierarchy for a child
// @route   GET /api/educational/hierarchy/:childId
// @access  Private (Parent/Child/Teacher)
exports.getEducationalHierarchy = async (req, res) => {
  try {
    const { childId } = req.params;
    const { academic_year = '2024-2025' } = req.query;

    // Get child's enrolled grade
    const [enrollments] = await db.query(
      'SELECT grade_id FROM student_enrollments WHERE student_id = ? AND is_active = 1',
      [childId]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'Child not enrolled in any grade' });
    }

    const gradeId = enrollments[0].grade_id;

    // Get complete hierarchy
    const [hierarchy] = await db.query(`
      SELECT 
        g.id as grade_id,
        g.name as grade_name,
        s.id as subject_id,
        s.name as subject_name,
        b.id as book_id,
        b.title as book_title,
        ch.id as chapter_id,
        ch.title as chapter_title,
        ch.is_released,
        ch.release_date,
        t.id as topic_id,
        t.title as topic_title,
        t.order_number as topic_order,
        t.is_unlocked,
        t.unlock_requirement,
        COUNT(a.id) as activity_count,
        COUNT(CASE WHEN cp.completed = 1 THEN 1 END) as completed_activities,
        tc.completion_score as topic_completion_score,
        tc.completed_at as topic_completed_at
      FROM grades g
      JOIN subjects s ON g.id = s.grade_id AND s.academic_year = ?
      JOIN books b ON s.id = b.subject_id AND b.academic_year = ?
      JOIN chapters ch ON b.id = ch.book_id
      JOIN topics t ON ch.id = t.chapter_id
      LEFT JOIN activities a ON t.id = a.topic_id AND a.status = 'active'
      LEFT JOIN child_progress cp ON a.id = cp.activity_id AND cp.child_id = ?
      LEFT JOIN topic_completions tc ON t.id = tc.topic_id AND tc.child_id = ?
      WHERE g.id = ?
      GROUP BY g.id, s.id, b.id, ch.id, t.id
      ORDER BY s.name, b.order_number, ch.chapter_number, t.order_number
    `, [academic_year, academic_year, childId, childId, gradeId]);

    res.json({
      success: true,
      hierarchy,
      academic_year
    });
  } catch (error) {
    console.error('Error getting educational hierarchy:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available topics for a child (considering chapter release and completion)
// @route   GET /api/educational/available-topics/:childId
// @access  Private (Parent/Child/Teacher)
exports.getAvailableTopics = async (req, res) => {
  try {
    const { childId } = req.params;
    const { academic_year = '2024-2025' } = req.query;

    const [availableTopics] = await db.query(`
      SELECT 
        t.id as topic_id,
        t.title as topic_title,
        t.description as topic_description,
        t.order_number,
        t.is_unlocked,
        t.unlock_requirement,
        ch.id as chapter_id,
        ch.title as chapter_title,
        ch.is_released,
        ch.release_date,
        b.id as book_id,
        b.title as book_title,
        s.id as subject_id,
        s.name as subject_name,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN cp.completed = 1 THEN 1 END) as completed_activities,
        tc.completion_score,
        tc.completed_at
      FROM topics t
      JOIN chapters ch ON t.chapter_id = ch.id
      JOIN books b ON ch.book_id = b.id
      JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN activities a ON t.id = a.topic_id AND a.status = 'active'
      LEFT JOIN child_progress cp ON a.id = cp.activity_id AND cp.child_id = ?
      LEFT JOIN topic_completions tc ON t.id = tc.topic_id AND tc.child_id = ?
      WHERE ch.is_released = 1
        AND s.academic_year = ?
        AND b.academic_year = ?
      GROUP BY t.id
      ORDER BY s.name, b.order_number, ch.chapter_number, t.order_number
    `, [childId, childId, academic_year, academic_year]);

    // Calculate which topics are actually available based on completion
    const processedTopics = availableTopics.map(topic => {
      const isAvailable = topic.is_unlocked || 
        (topic.unlock_requirement > 0 && topic.completed_activities >= topic.unlock_requirement);
      
      return {
        ...topic,
        is_available: isAvailable,
        progress_percentage: topic.total_activities > 0 ? 
          Math.round((topic.completed_activities / topic.total_activities) * 100) : 0
      };
    });

    res.json({
      success: true,
      topics: processedTopics
    });
  } catch (error) {
    console.error('Error getting available topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get activities for a specific topic
// @route   GET /api/educational/topics/:topicId/activities
// @access  Private (Parent/Child/Teacher)
exports.getTopicActivities = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { childId } = req.query;

    // Verify topic is available for this child
    const [topicCheck] = await db.query(`
      SELECT 
        t.id,
        t.title,
        t.is_unlocked,
        ch.is_released,
        tc.completion_score
      FROM topics t
      JOIN chapters ch ON t.chapter_id = ch.id
      LEFT JOIN topic_completions tc ON t.id = tc.topic_id AND tc.child_id = ?
      WHERE t.id = ?
    `, [childId, topicId]);

    if (topicCheck.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const topic = topicCheck[0];
    if (!topic.is_released) {
      return res.status(403).json({ message: 'Chapter not yet released' });
    }

    // Get activities for this topic
    const [activities] = await db.query(`
      SELECT 
        a.id,
        a.title,
        a.type,
        a.description,
        a.difficulty,
        a.estimated_duration,
        a.image_path,
        a.colors,
        a.data,
        cp.progress_value,
        cp.score,
        cp.completed,
        cp.attempts_count,
        cp.last_attempt_at,
        cp.teacher_feedback,
        cp.teacher_score,
        cp.is_assessed
      FROM activities a
      LEFT JOIN child_progress cp ON a.id = cp.activity_id AND cp.child_id = ?
      WHERE a.topic_id = ? AND a.status = 'active'
      ORDER BY a.id
    `, [childId, topicId]);

    res.json({
      success: true,
      topic: {
        id: topic.id,
        title: topic.title,
        completion_score: topic.completion_score
      },
      activities
    });
  } catch (error) {
    console.error('Error getting topic activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// ADMIN CONTROLLERS
// ============================================

// @desc    Release a chapter (Admin only)
// @route   POST /api/educational/admin/release-chapter
// @access  Private/Admin
exports.releaseChapter = async (req, res) => {
  try {
    const { chapterId, releaseDate, releaseNotes } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Update chapter release status
    await db.query(`
      UPDATE chapters 
      SET is_released = 1, release_date = ?, updated_at = NOW()
      WHERE id = ?
    `, [releaseDate, chapterId]);

    // Record the release
    await db.query(`
      INSERT INTO chapter_releases (chapter_id, release_date, released_by, release_notes)
      VALUES (?, ?, ?, ?)
    `, [chapterId, releaseDate, req.user.id, releaseNotes]);

    res.json({
      success: true,
      message: 'Chapter released successfully'
    });
  } catch (error) {
    console.error('Error releasing chapter:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all chapters with release status (Admin)
// @route   GET /api/educational/admin/chapters
// @access  Private/Admin
exports.getChaptersForAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [chapters] = await db.query(`
      SELECT 
        ch.id,
        ch.title,
        ch.description,
        ch.chapter_number,
        ch.is_released,
        ch.release_date,
        b.title as book_title,
        s.name as subject_name,
        g.name as grade_name,
        COUNT(t.id) as topic_count,
        COUNT(a.id) as activity_count
      FROM chapters ch
      JOIN books b ON ch.book_id = b.id
      JOIN subjects s ON b.subject_id = s.id
      JOIN grades g ON s.grade_id = g.id
      LEFT JOIN topics t ON ch.id = t.chapter_id
      LEFT JOIN activities a ON t.id = a.topic_id
      GROUP BY ch.id
      ORDER BY s.name, b.order_number, ch.chapter_number
    `);

    res.json({
      success: true,
      chapters
    });
  } catch (error) {
    console.error('Error getting chapters for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// PROGRESS TRACKING
// ============================================

// @desc    Complete a topic (called when all activities in topic are completed)
// @route   POST /api/educational/complete-topic
// @access  Private (Parent/Child)
exports.completeTopic = async (req, res) => {
  try {
    const { topicId, childId, completionScore } = req.body;

    // Verify all activities in topic are completed
    const [activities] = await db.query(`
      SELECT 
        a.id,
        cp.completed
      FROM activities a
      LEFT JOIN child_progress cp ON a.id = cp.activity_id AND cp.child_id = ?
      WHERE a.topic_id = ?
    `, [childId, topicId]);

    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.completed).length;

    if (completedActivities < totalActivities) {
      return res.status(400).json({ 
        message: 'Cannot complete topic - not all activities are finished' 
      });
    }

    // Record topic completion
    await db.query(`
      INSERT INTO topic_completions (child_id, topic_id, chapter_id, completion_score)
      VALUES (?, ?, (SELECT chapter_id FROM topics WHERE id = ?), ?)
      ON DUPLICATE KEY UPDATE 
      completion_score = VALUES(completion_score),
      completed_at = NOW()
    `, [childId, topicId, topicId, completionScore]);

    // Check if next topic should be unlocked
    const [nextTopic] = await db.query(`
      SELECT 
        t.id,
        t.title,
        t.unlock_requirement
      FROM topics t
      WHERE t.chapter_id = (SELECT chapter_id FROM topics WHERE id = ?)
        AND t.order_number > (SELECT order_number FROM topics WHERE id = ?)
      ORDER BY t.order_number
      LIMIT 1
    `, [topicId, topicId]);

    if (nextTopic.length > 0) {
      const nextTopicData = nextTopic[0];
      const completedTopics = await db.query(`
        SELECT COUNT(*) as count
        FROM topic_completions tc
        JOIN topics t ON tc.topic_id = t.id
        WHERE tc.child_id = ? 
          AND t.chapter_id = (SELECT chapter_id FROM topics WHERE id = ?)
          AND t.order_number < ?
      `, [childId, topicId, nextTopicData.unlock_requirement]);

      if (completedTopics[0][0].count >= nextTopicData.unlock_requirement) {
        await db.query(`
          UPDATE topics 
          SET is_unlocked = 1 
          WHERE id = ?
        `, [nextTopicData.id]);
      }
    }

    res.json({
      success: true,
      message: 'Topic completed successfully',
      next_topic_unlocked: nextTopic.length > 0
    });
  } catch (error) {
    console.error('Error completing topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get topics as levels for LetterPath component
// @route   GET /api/educational/letterpath/:childId
// @access  Private (Parent/Child/Teacher)
exports.getLetterPathTopics = async (req, res) => {
  try {
    const { childId } = req.params;
    const { academic_year = '2024-2025' } = req.query;

    // Get child's enrolled grade
    const [enrollments] = await db.query(
      'SELECT grade_id FROM student_enrollments WHERE student_id = ? AND is_active = 1',
      [childId]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'Child not enrolled in any grade' });
    }

    const gradeId = enrollments[0].grade_id;

    // Get all topics as levels, ordered by chapter and topic order
    const [topics] = await db.query(`
      SELECT 
        t.id as topic_id,
        t.title as topic_title,
        t.description as topic_description,
        t.order_number as level_number,
        t.is_unlocked,
        t.unlock_requirement,
        ch.id as chapter_id,
        ch.title as chapter_title,
        ch.is_released,
        ch.release_date,
        b.id as book_id,
        b.title as book_title,
        s.id as subject_id,
        s.name as subject_name,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN cp.completed = 1 THEN 1 END) as completed_activities,
        tc.completion_score,
        tc.completed_at,
        CASE 
          WHEN tc.completed_at IS NOT NULL THEN 'completed'
          WHEN ch.is_released = 1 AND (t.is_unlocked = 1 OR t.order_number = 1) THEN 'available'
          ELSE 'locked'
        END as status
      FROM topics t
      JOIN chapters ch ON t.chapter_id = ch.id
      JOIN books b ON ch.book_id = b.id
      JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN activities a ON t.id = a.topic_id AND a.status = 'active'
      LEFT JOIN child_progress cp ON a.id = cp.activity_id AND cp.child_id = ?
      LEFT JOIN topic_completions tc ON t.id = tc.topic_id AND tc.child_id = ?
      WHERE s.academic_year = ? 
        AND b.academic_year = ?
        AND s.grade_id = ?
      GROUP BY t.id
      ORDER BY s.name, b.order_number, ch.chapter_number, t.order_number
    `, [childId, childId, academic_year, academic_year, gradeId]);

    // Calculate overall progress for each topic
    const processedTopics = topics.map(topic => {
      const progressPercentage = topic.total_activities > 0 ? 
        Math.round((topic.completed_activities / topic.total_activities) * 100) : 0;
      
      return {
        ...topic,
        progress_percentage: progressPercentage,
        is_available: topic.status === 'available' || topic.status === 'completed'
      };
    });

    // Calculate overall progress across all topics
    const totalActivities = processedTopics.reduce((sum, topic) => sum + topic.total_activities, 0);
    const completedActivities = processedTopics.reduce((sum, topic) => sum + topic.completed_activities, 0);
    const overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    res.json({
      success: true,
      topics: processedTopics,
      overall_progress: overallProgress,
      total_levels: processedTopics.length
    });
  } catch (error) {
    console.error('Error getting LetterPath topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get child's learning progress overview
// @route   GET /api/educational/progress/:childId
// @access  Private (Parent/Child/Teacher)
exports.getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    const { academic_year = '2024-2025' } = req.query;

    const [progress] = await db.query(`
      SELECT 
        s.name as subject_name,
        b.title as book_title,
        ch.title as chapter_title,
        t.title as topic_title,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN cp.completed = 1 THEN 1 END) as completed_activities,
        AVG(cp.score) as average_score,
        tc.completion_score as topic_score,
        tc.completed_at as topic_completed_at
      FROM topics t
      JOIN chapters ch ON t.chapter_id = ch.id
      JOIN books b ON ch.book_id = b.id
      JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN activities a ON t.id = a.topic_id AND a.status = 'active'
      LEFT JOIN child_progress cp ON a.id = cp.activity_id AND cp.child_id = ?
      LEFT JOIN topic_completions tc ON t.id = tc.topic_id AND tc.child_id = ?
      WHERE s.academic_year = ? AND b.academic_year = ?
      GROUP BY t.id
      ORDER BY s.name, b.order_number, ch.chapter_number, t.order_number
    `, [childId, childId, academic_year, academic_year]);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error getting child progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEducationalHierarchy: exports.getEducationalHierarchy,
  getAvailableTopics: exports.getAvailableTopics,
  getTopicActivities: exports.getTopicActivities,
  releaseChapter: exports.releaseChapter,
  getChaptersForAdmin: exports.getChaptersForAdmin,
  completeTopic: exports.completeTopic,
  getChildProgress: exports.getChildProgress,
  getLetterPathTopics: exports.getLetterPathTopics
}; 