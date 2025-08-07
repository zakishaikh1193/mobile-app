const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../models/db');

// --- 1. Path and Directory Setup ---

const UPLOAD_PATH = path.join(__dirname, '..', 'uploads');
const ACTIVITIES_PATH = path.join(UPLOAD_PATH, 'activities');
const TEMP_PATH = path.join(UPLOAD_PATH, 'temp');

// Proactively create directories on startup to ensure they exist.
try {
    if (!fs.existsSync(ACTIVITIES_PATH)) fs.mkdirSync(ACTIVITIES_PATH, { recursive: true });
    if (!fs.existsSync(TEMP_PATH)) fs.mkdirSync(TEMP_PATH, { recursive: true });
} catch (error) {
    console.error("FATAL: Could not create upload directories.", error);
    process.exit(1); // Exit if the app can't function properly.
}

// --- 2. Multer Configuration ---

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TEMP_PATH), // Always upload to temp folder first
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// --- 3. Helper Functions ---

// Returns a clean, relative path for database storage.
const getRelativePath = (fullPath) => {
    return path.join('uploads', 'activities', path.basename(fullPath)).replace(/\\/g, '/');
};

// Formats an activity record for the client, adding the full image URL.
const processActivityForResponse = (activity) => {
    if (!activity) return null;
    let parsedColors = [];
    if (activity.colors) {
        try {
            parsedColors = typeof activity.colors === 'string' ? JSON.parse(activity.colors) : activity.colors;
        } catch (e) {
            parsedColors = []; // Default to empty array on parse error
        }
    }
    
    // Construct full URL for images
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://prek-backend.bylinelms.com' 
        : 'http://localhost:3000';
    
    return {
        ...activity,
        image_url: activity.image_path ? `${baseUrl}/${activity.image_path.replace(/\\/g, '/')}` : null,
        colors: parsedColors,
    };
};

// --- 4. CRUD Routes ---

/**
 * CREATE a new activity
 * POST /api/activities
 */
router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        const {
            title, type, description, difficulty = 'easy', colors, grade_id,
            book_id, unit_id, lesson_id, learning_objectives, prerequisites,
            estimated_duration = 10, max_attempts = 3, passing_score = 70
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required for new activities.' });
        }
        if (!title || !type || !description) {
            return res.status(400).json({ error: 'Title, type, and description are required.' });
        }

        // Move the file from temp to its final destination
        const finalPath = path.join(ACTIVITIES_PATH, req.file.filename);
        fs.renameSync(req.file.path, finalPath);
        const imageDbPath = getRelativePath(finalPath);

        const [result] = await pool.query(
            `INSERT INTO activities (
                title, type, description, difficulty, image_path, colors, 
                grade_id, book_id, unit_id, lesson_id, learning_objectives, 
                prerequisites, estimated_duration, max_attempts, passing_score,
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
            [
                title, type, description, difficulty, imageDbPath, colors || '[]',
                grade_id || null, book_id || null, unit_id || null, lesson_id || null,
                learning_objectives || null, prerequisites || null, estimated_duration,
                max_attempts, passing_score
            ]
        );

        res.status(201).json({ message: 'Activity created successfully', activityId: result.insertId });
    } catch (error) {
        // If an error occurs, delete the uploaded temp file to prevent orphans.
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if(err) console.error("Error deleting temp file on failure:", err);
            });
        }
        next(error); // Pass error to the global handler
    }
});

/**
 * READ all activities (with optional filtering)
 * GET /api/activities
 */
router.get('/', async (req, res, next) => {
    try {
        // ... (Your existing GET all code is good and remains here)
        // This code was already functional.
        const { type, grade_id, book_id, unit_id, lesson_id } = req.query;
        let query = `
            SELECT 
                a.*,
                g.name as grade_name,
                b.title as book_title,
                u.title as unit_title,
                l.title as lesson_title
            FROM activities a
            LEFT JOIN grades g ON a.grade_id = g.id
            LEFT JOIN books b ON a.book_id = b.id
            LEFT JOIN units u ON a.unit_id = u.id
            LEFT JOIN lessons l ON a.lesson_id = l.id
            WHERE a.status = "active"
        `;
        let params = [];
        if (type) { query += ' AND a.type = ?'; params.push(type); }
        if (grade_id) { query += ' AND a.grade_id = ?'; params.push(grade_id); }
        if (book_id) { query += ' AND a.book_id = ?'; params.push(book_id); }
        if (unit_id) { query += ' AND a.unit_id = ?'; params.push(unit_id); }
        if (lesson_id) { query += ' AND a.lesson_id = ?'; params.push(lesson_id); }
        query += ' ORDER BY a.created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json(rows.map(processActivityForResponse));
    } catch (error) {
        next(error);
    }
});

/**
 * READ a single activity by ID
 * GET /api/activities/:id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                g.name as grade_name,
                b.title as book_title,
                u.title as unit_title,
                l.title as lesson_title
            FROM activities a
            LEFT JOIN grades g ON a.grade_id = g.id
            LEFT JOIN books b ON a.book_id = b.id
            LEFT JOIN units u ON a.unit_id = u.id
            LEFT JOIN lessons l ON a.lesson_id = l.id
            WHERE a.id = ? AND a.status = "active"
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        const activity = processActivityForResponse(rows[0]);
        res.json({
            success: true,
            activity: activity
        });
    } catch (error) {
        next(error);
    }
});

/**
 * UPDATE an existing activity by ID
 * PUT /api/activities/:id
 */
router.put('/:id', upload.single('image'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingRows] = await pool.query('SELECT image_path FROM activities WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const updateFields = { ...req.body };
        let oldImagePath = existingRows[0].image_path;

        // If a new file is uploaded, handle the file move and path update.
        if (req.file) {
            const finalPath = path.join(ACTIVITIES_PATH, req.file.filename);
            fs.renameSync(req.file.path, finalPath);
            updateFields.image_path = getRelativePath(finalPath);
        }

        // Prepare for dynamic SQL query
        delete updateFields.id; // Prevent updating the primary key
        const fieldEntries = Object.entries(updateFields);
        if (fieldEntries.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = fieldEntries.map(([key]) => `${key} = ?`).join(', ');
        const values = fieldEntries.map(([, val]) => val);

        await pool.query(`UPDATE activities SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
        
        // If update was successful and a new image was uploaded, delete the old one.
        if (req.file && oldImagePath) {
            const fullOldPath = path.join(__dirname, '..', oldImagePath);
            fs.unlink(fullOldPath, err => {
                if (err) console.error("Non-fatal: Error deleting old image:", err);
            });
        }

        res.json({ message: 'Activity updated successfully' });
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if(err) console.error("Error deleting temp file on update failure:", err);
            });
        }
        next(error);
    }
});


/**
 * DELETE an activity by ID (Soft Delete)
 * DELETE /api/activities/:id
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query(
            'UPDATE activities SET status = "deleted", updated_at = NOW() WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        // NOTE: The physical image file is NOT deleted on soft delete,
        // allowing for potential restoration in the future.
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        next(error);
    }
});


// --- 5. Global Error Handler for This Router ---

// This middleware catches errors from Multer and any other errors passed via `next(error)`.
router.use((error, req, res, next) => {
    console.error("An error occurred in the activities router:", error);

    if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: `File upload error: ${error.message}` });
    }
    
    // For any other errors, send a generic response.
    res.status(500).json({ error: `An unexpected server error occurred: ${error.message}`});
});


router.get('/hierarchy/:gradeId?/:bookId?/:unitId?/:lessonId?', async (req, res) => {
    try {
        const { gradeId, bookId, unitId, lessonId } = req.params;
        const { type } = req.query;
        
        let query = `
            SELECT 
                a.*,
                g.name as grade_name,
                b.title as book_title,
                u.title as unit_title,
                l.title as lesson_title
            FROM activities a
            LEFT JOIN grades g ON a.grade_id = g.id
            LEFT JOIN books b ON a.book_id = b.id
            LEFT JOIN units u ON a.unit_id = u.id
            LEFT JOIN lessons l ON a.lesson_id = l.id
            WHERE a.status = "active"
        `;
        let params = [];

        if (gradeId) {
            query += ' AND a.grade_id = ?';
            params.push(gradeId);
        }
        if (bookId) {
            query += ' AND a.book_id = ?';
            params.push(bookId);
        }
        if (unitId) {
            query += ' AND a.unit_id = ?';
            params.push(unitId);
        }
        if (lessonId) {
            query += ' AND a.lesson_id = ?';
            params.push(lessonId);
        }
        if (type) {
            query += ' AND a.type = ?';
            params.push(type);
        }
        query += ' ORDER BY a.type, a.created_at DESC';

        const [rows] = await pool.query(query, params);
        const activities = rows.map(processActivityForResponse);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities by hierarchy:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get activities for teacher's assigned grades
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { type } = req.query;
        
        let query = `
            SELECT 
                a.*,
                g.name as grade_name,
                b.title as book_title,
                u.title as unit_title,
                l.title as lesson_title
            FROM activities a
            LEFT JOIN grades g ON a.grade_id = g.id
            LEFT JOIN books b ON a.book_id = b.id
            LEFT JOIN units u ON a.unit_id = u.id
            LEFT JOIN lessons l ON a.lesson_id = l.id
            JOIN teacher_grade_assignments tga ON a.grade_id = tga.grade_id
            WHERE a.status = "active" AND tga.teacher_id = ?
        `;
        let params = [teacherId];

        if (type) {
            query += ' AND a.type = ?';
            params.push(type);
        }
        query += ' ORDER BY a.type, a.created_at DESC';

        const [rows] = await pool.query(query, params);
        const activities = rows.map(processActivityForResponse);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching teacher activities:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- 6. Progress Tracking System ---

/**
 * GET all progress for a child
 * GET /api/activities/progress/:childId
 */
router.get('/progress/:childId', async (req, res, next) => {
    try {
        const { childId } = req.params;
        const [rows] = await pool.query(
            `SELECT cp.*, a.title as activity_title, a.type as activity_type
             FROM child_progress cp
             LEFT JOIN activities a ON cp.activity_id = a.id
             WHERE cp.child_id = ?
             ORDER BY cp.updated_at DESC`,
            [childId]
        );
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

/**
 * Record/update progress for an activity
 * POST /api/activities/progress/:childId/:activityId
 */
router.post('/progress/:childId/:activityId', async (req, res, next) => {
    try {
        const { childId, activityId } = req.params;
        const { score, completed, time_spent, attempts_count, lesson_id, unit_id, book_id, grade_id } = req.body;
        
        await pool.query(`
            INSERT INTO child_progress (
                child_id, activity_id, lesson_id, unit_id, book_id, grade_id,
                score, completed, time_spent, attempts_count, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                completed = VALUES(completed),
                time_spent = VALUES(time_spent),
                attempts_count = VALUES(attempts_count),
                completed_at = CASE WHEN VALUES(completed) = 1 THEN NOW() ELSE completed_at END,
                updated_at = NOW()
        `, [childId, activityId, lesson_id || null, unit_id || null, book_id || null, grade_id || null, 
             score || 0, completed || 0, time_spent || 0, attempts_count || 1, 
             completed ? new Date() : null]);
        
        res.json({ success: true, message: 'Progress recorded successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * Get unit completion progress for a child
 * GET /api/activities/units/:unitId/progress/:childId
 */
router.get('/units/:unitId/progress/:childId', async (req, res, next) => {
    try {
        const { unitId, childId } = req.params;
        const [rows] = await pool.query(`
            SELECT cp.*, a.title as activity_title, a.type as activity_type
            FROM child_progress cp
            LEFT JOIN activities a ON cp.activity_id = a.id
            WHERE cp.child_id = ? AND cp.unit_id = ?
            ORDER BY cp.updated_at DESC
        `, [childId, unitId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

/**
 * Get lesson completion progress for a child
 * GET /api/activities/lessons/:lessonId/progress/:childId
 */
router.get('/lessons/:lessonId/progress/:childId', async (req, res, next) => {
    try {
        const { lessonId, childId } = req.params;
        const [rows] = await pool.query(`
            SELECT cp.*, a.title as activity_title, a.type as activity_type
            FROM child_progress cp
            LEFT JOIN activities a ON cp.activity_id = a.id
            WHERE cp.child_id = ? AND cp.lesson_id = ?
            ORDER BY cp.updated_at DESC
        `, [childId, lessonId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// --- 7. Unlock/Lock System ---

/**
 * Unlock a unit for a child
 * PUT /api/activities/units/:unitId/unlock/:childId
 */
router.put('/units/:unitId/unlock/:childId', async (req, res, next) => {
    try {
        const { unitId, childId } = req.params;
        await pool.query(`
            INSERT INTO unit_completions (unit_id, child_id, unlocked, unlocked_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE unlocked = 1, unlocked_at = NOW()
        `, [unitId, childId]);
        res.json({ success: true, message: 'Unit unlocked successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * Unlock a lesson for a child
 * PUT /api/activities/lessons/:lessonId/unlock/:childId
 */
router.put('/lessons/:lessonId/unlock/:childId', async (req, res, next) => {
    try {
        const { lessonId, childId } = req.params;
        await pool.query(`
            UPDATE lessons SET is_unlocked = 1, unlocked_by = ?, unlocked_at = NOW() 
            WHERE id = ?
        `, [childId, lessonId]);
        res.json({ success: true, message: 'Lesson unlocked successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * Get all unlocked content for a child
 * GET /api/activities/unlocked/:childId
 */
router.get('/unlocked/:childId', async (req, res, next) => {
    try {
        const { childId } = req.params;
        
        // Get unlocked units
        const [units] = await pool.query(`
            SELECT uc.*, u.title as unit_title, u.description as unit_description
            FROM unit_completions uc
            LEFT JOIN units u ON uc.unit_id = u.id
            WHERE uc.child_id = ? AND uc.unlocked = 1
        `, [childId]);
        
        // Get unlocked lessons
        const [lessons] = await pool.query(`
            SELECT l.*, u.title as unit_title
            FROM lessons l
            LEFT JOIN units u ON l.unit_id = u.id
            WHERE l.is_unlocked = 1 AND l.unlocked_by = ?
        `, [childId]);
        
        res.json({ units, lessons });
    } catch (error) {
        next(error);
    }
});

// --- 8. Assessment Features (Teacher) ---

/**
 * Create/update assessment for a child's activity
 * POST /api/activities/assessments
 */
router.post('/assessments', async (req, res, next) => {
    try {
        const { child_id, activity_id, teacher_score, teacher_feedback, assessed_by } = req.body;
        
        await pool.query(`
            UPDATE child_progress SET 
                teacher_score = ?,
                teacher_feedback = ?,
                is_assessed = 1,
                assessed_by = ?,
                assessed_at = NOW(),
                updated_at = NOW()
            WHERE child_id = ? AND activity_id = ?
        `, [teacher_score, teacher_feedback, assessed_by, child_id, activity_id]);
        
        res.json({ success: true, message: 'Assessment recorded successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * Get all assessments by a teacher
 * GET /api/activities/assessments/teacher/:teacherId
 */
router.get('/assessments/teacher/:teacherId', async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const [rows] = await pool.query(`
            SELECT cp.*, a.title as activity_title, a.type as activity_type,
                   c.name as child_name
            FROM child_progress cp
            LEFT JOIN activities a ON cp.activity_id = a.id
            LEFT JOIN children c ON cp.child_id = c.id
            WHERE cp.assessed_by = ? AND cp.is_assessed = 1
            ORDER BY cp.assessed_at DESC
        `, [teacherId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

/**
 * Get assessment for a specific child's activity
 * GET /api/activities/assessments/:childId/:activityId
 */
router.get('/assessments/:childId/:activityId', async (req, res, next) => {
    try {
        const { childId, activityId } = req.params;
        const [rows] = await pool.query(`
            SELECT cp.*, a.title as activity_title, a.type as activity_type
            FROM child_progress cp
            LEFT JOIN activities a ON cp.activity_id = a.id
            WHERE cp.child_id = ? AND cp.activity_id = ? AND cp.is_assessed = 1
        `, [childId, activityId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// --- 9. Child Dashboard Routes ---

/**
 * Get activities for a child's enrolled grade
 * GET /api/activities/child/:childId/activities
 */
router.get('/child/:childId/activities', async (req, res, next) => {
    try {
        const { childId } = req.params;
        const { type } = req.query;
        
        // Get child's enrolled grade
        const [childEnrollment] = await pool.query(`
            SELECT se.grade_id, g.name as grade_name
            FROM student_enrollments se
            LEFT JOIN grades g ON se.grade_id = g.id
            WHERE se.student_id = ?
        `, [childId]);
        
        if (childEnrollment.length === 0) {
            return res.status(404).json({ error: 'Child not enrolled in any grade' });
        }
        
        const gradeId = childEnrollment[0].grade_id;
        
        // Get activities for child's grade
        let query = `
            SELECT 
                a.*,
                g.name as grade_name,
                b.title as book_title,
                u.title as unit_title,
                l.title as lesson_title
            FROM activities a
            LEFT JOIN grades g ON a.grade_id = g.id
            LEFT JOIN books b ON a.book_id = b.id
            LEFT JOIN units u ON a.unit_id = u.id
            LEFT JOIN lessons l ON a.lesson_id = l.id
            WHERE a.status = "active" AND a.grade_id = ?
        `;
        let params = [gradeId];
        
        if (type) {
            query += ' AND a.type = ?';
            params.push(type);
        }
        query += ' ORDER BY a.created_at DESC';
        
        const [rows] = await pool.query(query, params);
        res.json(rows.map(processActivityForResponse));
    } catch (error) {
        next(error);
    }
});

/**
 * Get child's overall progress
 * GET /api/activities/child/:childId/progress
 */
router.get('/child/:childId/progress', async (req, res, next) => {
    try {
        const { childId } = req.params;
        
        // Get overall progress summary
        const [progressSummary] = await pool.query(`
            SELECT 
                COUNT(*) as total_activities,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_activities,
                AVG(score) as average_score,
                SUM(time_spent) as total_time_spent
            FROM child_progress
            WHERE child_id = ?
        `, [childId]);
        
        // Get progress by grade
        const [gradeProgress] = await pool.query(`
            SELECT 
                cp.grade_id,
                g.name as grade_name,
                COUNT(*) as total_activities,
                SUM(CASE WHEN cp.completed = 1 THEN 1 ELSE 0 END) as completed_activities,
                AVG(cp.score) as average_score
            FROM child_progress cp
            LEFT JOIN grades g ON cp.grade_id = g.id
            WHERE cp.child_id = ?
            GROUP BY cp.grade_id
        `, [childId]);
        
        // Get recent activity progress
        const [recentProgress] = await pool.query(`
            SELECT cp.*, a.title as activity_title, a.type as activity_type
            FROM child_progress cp
            LEFT JOIN activities a ON cp.activity_id = a.id
            WHERE cp.child_id = ?
            ORDER BY cp.updated_at DESC
            LIMIT 10
        `, [childId]);
        
        res.json({
            summary: progressSummary[0] || {},
            gradeProgress,
            recentProgress
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get child's unlocked content
 * GET /api/activities/child/:childId/unlocked-content
 */
router.get('/child/:childId/unlocked-content', async (req, res, next) => {
    try {
        const { childId } = req.params;
        
        // Get unlocked units
        const [unlockedUnits] = await pool.query(`
            SELECT uc.*, u.title as unit_title, u.description as unit_description,
                   b.title as book_title, g.name as grade_name
            FROM unit_completions uc
            LEFT JOIN units u ON uc.unit_id = u.id
            LEFT JOIN books b ON u.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            WHERE uc.child_id = ? AND uc.unlocked = 1
        `, [childId]);
        
        // Get unlocked lessons
        const [unlockedLessons] = await pool.query(`
            SELECT l.*, u.title as unit_title, b.title as book_title, g.name as grade_name
            FROM lessons l
            LEFT JOIN units u ON l.unit_id = u.id
            LEFT JOIN books b ON u.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            WHERE l.is_unlocked = 1 AND l.unlocked_by = ?
        `, [childId]);
        
        // Get unlocked activities
        const [unlockedActivities] = await pool.query(`
            SELECT DISTINCT a.*, g.name as grade_name, b.title as book_title,
                   u.title as unit_title, l.title as lesson_title
            FROM activities a
            LEFT JOIN grades g ON a.grade_id = g.id
            LEFT JOIN books b ON a.book_id = b.id
            LEFT JOIN units u ON a.unit_id = u.id
            LEFT JOIN lessons l ON a.lesson_id = l.id
            LEFT JOIN unit_completions uc ON a.unit_id = uc.unit_id AND uc.child_id = ?
            LEFT JOIN lessons unlocked_lessons ON a.lesson_id = unlocked_lessons.id 
                AND unlocked_lessons.is_unlocked = 1 AND unlocked_lessons.unlocked_by = ?
            WHERE a.status = "active" 
                AND (uc.unlocked = 1 OR unlocked_lessons.id IS NOT NULL)
        `, [childId, childId]);
        
        res.json({
            units: unlockedUnits,
            lessons: unlockedLessons,
            activities: unlockedActivities.map(processActivityForResponse)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get books assigned to a child
 * GET /api/activities/child/:childId/enrolled-books
 */
router.get('/child/:childId/enrolled-books', async (req, res, next) => {
    try {
        const { childId } = req.params;
        
        const [books] = await pool.query(`
            SELECT 
                b.id as book_id,
                b.title as book_title,
                b.description as book_description,
                g.name as grade_name,
                COUNT(DISTINCT sbe.student_id) as enrolled_students,
                COUNT(DISTINCT u.id) as total_units,
                COUNT(DISTINCT CASE WHEN u.is_unlocked = 1 THEN u.id END) as unlocked_units,
                COUNT(DISTINCT l.id) as total_lessons,
                COUNT(DISTINCT CASE WHEN l.is_unlocked = 1 THEN l.id END) as unlocked_lessons
            FROM student_book_enrollments sbe
            LEFT JOIN books b ON sbe.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            LEFT JOIN units u ON b.id = u.book_id
            LEFT JOIN lessons l ON u.id = l.unit_id
            WHERE sbe.student_id = ? AND sbe.is_active = 1 AND b.is_active = 1
            GROUP BY b.id
            ORDER BY b.title
        `, [childId]);
        
        res.json(books);
    } catch (error) {
        next(error);
    }
});

/**
 * Get units and lessons for a specific book
 * GET /api/activities/book/:bookId/units-lessons/:childId
 */
router.get('/book/:bookId/units-lessons/:childId', async (req, res, next) => {
    try {
        const { bookId, childId } = req.params;
        
        // Get book info
        const [bookInfo] = await pool.query(`
            SELECT b.*, g.name as grade_name
            FROM books b
            LEFT JOIN grades g ON b.grade_id = g.id
            WHERE b.id = ? AND b.is_active = 1
        `, [bookId]);
        
        if (bookInfo.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        // Get units for the book
        const [units] = await pool.query(`
            SELECT 
                u.id as unit_id,
                u.title as unit_title,
                u.description as unit_description,
                u.unit_number,
                u.is_unlocked,
                u.unlocked_by,
                u.unlocked_at
            FROM units u
            WHERE u.book_id = ? AND u.is_active = 1
            ORDER BY u.unit_number
        `, [bookId]);
        
        // Get lessons for each unit
        for (let unit of units) {
            const [lessons] = await pool.query(`
                SELECT 
                    l.id as lesson_id,
                    l.title as lesson_title,
                    l.description as lesson_description,
                    l.lesson_number,
                    l.is_unlocked,
                    l.unlocked_by,
                    l.unlocked_at
                FROM lessons l
                WHERE l.unit_id = ? AND l.is_active = 1
                ORDER BY l.lesson_number
            `, [unit.unit_id]);
            
            unit.lessons = lessons;
        }
        
        res.json({
            success: true,
            book: bookInfo[0],
            units: units
        });
    } catch (error) {
        next(error);
    }
});

// --- 10. Teacher-Book Assignment Routes ---

/**
 * Assign teacher to a book (Admin only)
 * POST /api/activities/teacher-book-assignments
 */
router.post('/teacher-book-assignments', async (req, res, next) => {
    try {
        const { teacher_id, book_id, academic_year = '2024-2025' } = req.body;
        
        await pool.query(`
            INSERT INTO teacher_book_assignments (teacher_id, book_id, academic_year)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()
        `, [teacher_id, book_id, academic_year]);
        
        res.json({ success: true, message: 'Teacher assigned to book successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * Get all teacher-book assignments (Admin only)
 * GET /api/activities/teacher-book-assignments/all
 */
router.get('/teacher-book-assignments/all', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT tba.*, b.title as book_title, b.description as book_description,
                   g.name as grade_name, g.id as grade_id,
                   CONCAT(u.first_name, ' ', u.last_name) as teacher_name
            FROM teacher_book_assignments tba
            LEFT JOIN books b ON tba.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            LEFT JOIN users u ON tba.teacher_id = u.id
            WHERE tba.is_active = 1 AND b.is_active = 1
            ORDER BY u.first_name, b.title
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

/**
 * Get teacher's assigned books
 * GET /api/activities/teacher-book-assignments/:teacherId
 */
router.get('/teacher-book-assignments/:teacherId', async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const [rows] = await pool.query(`
            SELECT tba.*, b.title as book_title, b.description as book_description,
                   g.name as grade_name, g.id as grade_id
            FROM teacher_book_assignments tba
            LEFT JOIN books b ON tba.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            WHERE tba.teacher_id = ? AND tba.is_active = 1 AND b.is_active = 1
            ORDER BY b.title
        `, [teacherId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});



/**
 * Remove teacher from book assignment
 * DELETE /api/activities/teacher-book-assignments/:teacherId/:bookId
 */
router.delete('/teacher-book-assignments/:teacherId/:bookId', async (req, res, next) => {
    try {
        const { teacherId, bookId } = req.params;
        await pool.query(`
            UPDATE teacher_book_assignments 
            SET is_active = 0, updated_at = NOW()
            WHERE teacher_id = ? AND book_id = ?
        `, [teacherId, bookId]);
        res.json({ success: true, message: 'Teacher removed from book assignment' });
    } catch (error) {
        next(error);
    }
});

// --- 11. Student Enrollment Routes ---

/**
 * Enroll students in a book (Teacher only)
 * POST /api/activities/student-book-enrollments
 */
router.post('/student-book-enrollments', async (req, res, next) => {
    try {
        const { student_ids, book_id, enrolled_by, academic_year = '2024-2025' } = req.body;
        
        // Validate that the teacher is assigned to this book
        const [teacherAssignment] = await pool.query(`
            SELECT id FROM teacher_book_assignments 
            WHERE teacher_id = ? AND book_id = ? AND is_active = 1
        `, [enrolled_by, book_id]);
        
        if (teacherAssignment.length === 0) {
            return res.status(403).json({ error: 'Teacher not assigned to this book' });
        }
        
        // Enroll each student
        for (const studentId of student_ids) {
            await pool.query(`
                INSERT INTO student_book_enrollments (student_id, book_id, enrolled_by, academic_year)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()
            `, [studentId, book_id, enrolled_by, academic_year]);
        }
        
        res.json({ success: true, message: `${student_ids.length} students enrolled successfully` });
    } catch (error) {
        next(error);
    }
});

/**
 * Enroll students in a unit (Teacher only)
 * POST /api/activities/student-unit-enrollments
 */
router.post('/student-unit-enrollments', async (req, res, next) => {
    try {
        const { student_ids, unit_id, enrolled_by } = req.body;
        
        // Validate that the teacher is assigned to the book containing this unit
        const [teacherAssignment] = await pool.query(`
            SELECT tba.id FROM teacher_book_assignments tba
            JOIN units u ON tba.book_id = u.book_id
            WHERE tba.teacher_id = ? AND u.id = ? AND tba.is_active = 1
        `, [enrolled_by, unit_id]);
        
        if (teacherAssignment.length === 0) {
            return res.status(403).json({ error: 'Teacher not assigned to this unit' });
        }
        
        // Enroll each student
        for (const studentId of student_ids) {
            await pool.query(`
                INSERT INTO student_unit_enrollments (student_id, unit_id, enrolled_by)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()
            `, [studentId, unit_id, enrolled_by]);
        }
        
        res.json({ success: true, message: `${student_ids.length} students enrolled in unit successfully` });
    } catch (error) {
        next(error);
    }
});

/**
 * Enroll students in a lesson (Teacher only)
 * POST /api/activities/student-lesson-enrollments
 */
router.post('/student-lesson-enrollments', async (req, res, next) => {
    try {
        const { student_ids, lesson_id, enrolled_by } = req.body;
        
        // Validate that the teacher is assigned to the book containing this lesson
        const [teacherAssignment] = await pool.query(`
            SELECT tba.id FROM teacher_book_assignments tba
            JOIN units u ON tba.book_id = u.book_id
            JOIN lessons l ON u.id = l.unit_id
            WHERE tba.teacher_id = ? AND l.id = ? AND tba.is_active = 1
        `, [enrolled_by, lesson_id]);
        
        if (teacherAssignment.length === 0) {
            return res.status(403).json({ error: 'Teacher not assigned to this lesson' });
        }
        
        // Enroll each student
        for (const studentId of student_ids) {
            await pool.query(`
                INSERT INTO student_lesson_enrollments (student_id, lesson_id, enrolled_by)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE is_active = 1, updated_at = NOW()
            `, [studentId, lesson_id, enrolled_by]);
        }
        
        res.json({ success: true, message: `${student_ids.length} students enrolled in lesson successfully` });
    } catch (error) {
        next(error);
    }
});

/**
 * Get students enrolled in a book
 * GET /api/activities/student-book-enrollments/:bookId
 */
router.get('/student-book-enrollments/:bookId', async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const [rows] = await pool.query(`
            SELECT sbe.*, c.first_name, c.username, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM student_book_enrollments sbe
            LEFT JOIN children c ON sbe.student_id = c.id
            LEFT JOIN users u ON sbe.enrolled_by = u.id
            WHERE sbe.book_id = ? AND sbe.is_active = 1
            ORDER BY c.first_name
        `, [bookId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

/**
 * Get students enrolled in a unit
 * GET /api/activities/student-unit-enrollments/:unitId
 */
router.get('/student-unit-enrollments/:unitId', async (req, res, next) => {
    try {
        const { unitId } = req.params;
        const [rows] = await pool.query(`
            SELECT sue.*, c.first_name, c.username, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM student_unit_enrollments sue
            LEFT JOIN children c ON sue.student_id = c.id
            LEFT JOIN users u ON sue.enrolled_by = u.id
            WHERE sue.unit_id = ? AND sue.is_active = 1
            ORDER BY c.first_name
        `, [unitId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

/**
 * Get students enrolled in a lesson
 * GET /api/activities/student-lesson-enrollments/:lessonId
 */
router.get('/student-lesson-enrollments/:lessonId', async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const [rows] = await pool.query(`
            SELECT sle.*, c.first_name, c.username, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM student_lesson_enrollments sle
            LEFT JOIN children c ON sle.student_id = c.id
            LEFT JOIN users u ON sle.enrolled_by = u.id
            WHERE sle.lesson_id = ? AND sle.is_active = 1
            ORDER BY c.first_name
        `, [lessonId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// --- 12. Teacher Dashboard Routes ---

/**
 * Get teacher's dashboard summary
 * GET /api/activities/teacher-dashboard/:teacherId
 */
router.get('/teacher-dashboard/:teacherId', async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        
        // Get assigned books summary
        const [assignedBooks] = await pool.query(`
            SELECT 
                tba.book_id,
                b.title as book_title,
                g.name as grade_name,
                COUNT(DISTINCT sbe.student_id) as enrolled_students,
                COUNT(DISTINCT u.id) as total_units,
                COUNT(DISTINCT CASE WHEN u.is_unlocked = 1 THEN u.id END) as unlocked_units,
                COUNT(DISTINCT l.id) as total_lessons,
                COUNT(DISTINCT CASE WHEN l.is_unlocked = 1 THEN l.id END) as unlocked_lessons
            FROM teacher_book_assignments tba
            LEFT JOIN books b ON tba.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            LEFT JOIN student_book_enrollments sbe ON b.id = sbe.book_id AND sbe.is_active = 1
            LEFT JOIN units u ON b.id = u.book_id
            LEFT JOIN lessons l ON u.id = l.unit_id
            WHERE tba.teacher_id = ? AND tba.is_active = 1 AND b.is_active = 1
            GROUP BY tba.book_id
        `, [teacherId]);
        
        // Get total students across all assigned books
        const [totalStudents] = await pool.query(`
            SELECT COUNT(DISTINCT sbe.student_id) as total_students
            FROM teacher_book_assignments tba
            LEFT JOIN student_book_enrollments sbe ON tba.book_id = sbe.book_id AND sbe.is_active = 1
            WHERE tba.teacher_id = ? AND tba.is_active = 1
        `, [teacherId]);
        
        res.json({
            assignedBooks,
            totalStudents: totalStudents[0]?.total_students || 0
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get teacher's assigned books with units and lessons
 * GET /api/activities/teacher-books/:teacherId
 */
router.get('/teacher-books/:teacherId', async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const [books] = await pool.query(`
            SELECT 
                b.id as book_id,
                b.title as book_title,
                b.description as book_description,
                g.name as grade_name,
                g.id as grade_id,
                COUNT(DISTINCT sbe.student_id) as enrolled_students
            FROM teacher_book_assignments tba
            LEFT JOIN books b ON tba.book_id = b.id
            LEFT JOIN grades g ON b.grade_id = g.id
            LEFT JOIN student_book_enrollments sbe ON b.id = sbe.book_id AND sbe.is_active = 1
            WHERE tba.teacher_id = ? AND tba.is_active = 1 AND b.is_active = 1
            GROUP BY b.id
            ORDER BY b.title
        `, [teacherId]);
        
        // Get units for each book
        for (let book of books) {
            const [units] = await pool.query(`
                SELECT 
                    u.id as unit_id,
                    u.title as unit_title,
                    u.description as unit_description,
                    u.unit_number,
                    u.is_unlocked,
                    COUNT(DISTINCT sue.student_id) as enrolled_students,
                    COUNT(DISTINCT l.id) as total_lessons,
                    COUNT(DISTINCT CASE WHEN l.is_unlocked = 1 THEN l.id END) as unlocked_lessons
                FROM units u
                LEFT JOIN student_unit_enrollments sue ON u.id = sue.unit_id AND sue.is_active = 1
                LEFT JOIN lessons l ON u.id = l.unit_id
                WHERE u.book_id = ? AND u.is_active = 1
                GROUP BY u.id
                ORDER BY u.unit_number
            `, [book.book_id]);
            
            // Get lessons for each unit
            for (let unit of units) {
                const [lessons] = await pool.query(`
                    SELECT 
                        l.id as lesson_id,
                        l.title as lesson_title,
                        l.lesson_number,
                        l.is_unlocked,
                        COUNT(DISTINCT sle.student_id) as enrolled_students
                    FROM lessons l
                    LEFT JOIN student_lesson_enrollments sle ON l.id = sle.lesson_id AND sle.is_active = 1
                    WHERE l.unit_id = ? AND l.is_active = 1
                    GROUP BY l.id
                    ORDER BY l.lesson_number
                `, [unit.unit_id]);
                
                unit.lessons = lessons;
            }
            
            book.units = units;
        }
        
        res.json(books);
    } catch (error) {
        next(error);
    }
});

/**
 * Get activities by lesson ID grouped by type
 * GET /api/activities/lesson/:lessonId
 */
router.get('/lesson/:lessonId', async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        
        // Get lesson info
        const [lessonInfo] = await pool.query(`
            SELECT l.*, u.title as unit_title, b.title as book_title
            FROM lessons l
            LEFT JOIN units u ON l.unit_id = u.id
            LEFT JOIN books b ON u.book_id = b.id
            WHERE l.id = ? AND l.is_active = 1
        `, [lessonId]);
        
        if (lessonInfo.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        // Get activities for this lesson, grouped by type
        const [activities] = await pool.query(`
            SELECT 
                id, title, type, description, difficulty, image_path, colors,
                estimated_duration, max_attempts, passing_score, status
            FROM activities 
            WHERE lesson_id = ? AND status = 'active'
            ORDER BY type, title
        `, [lessonId]);
        
        // Group activities by type
        const activitiesByType = activities.reduce((acc, activity) => {
            if (!acc[activity.type]) {
                acc[activity.type] = [];
            }
            acc[activity.type].push(processActivityForResponse(activity));
            return acc;
        }, {});
        
        // Get activity type metadata (for display names, icons, etc.)
        const activityTypes = {
            coloring: { name: 'Coloring Activities', icon: '🎨', description: 'Creative coloring exercises' },
            letter_match: { name: 'Letter Matching', icon: '🔤', description: 'Match letters and sounds' },
            bubble_pop: { name: 'Bubble Pop', icon: '🫧', description: 'Interactive bubble popping games' },
            counting: { name: 'Counting Games', icon: '🔢', description: 'Number and counting activities' },
            emotion_match: { name: 'Emotion Matching', icon: '😊', description: 'Learn about emotions' },
            family_tree: { name: 'Family Tree', icon: '👨‍👩‍👧‍👦', description: 'Family relationship activities' },
            digital_painting: { name: 'Digital Painting', icon: '🖼️', description: 'Digital art creation' },
            forest_hunt: { name: 'Forest Hunt', icon: '🌲', description: 'Adventure in the forest' }
        };
        
        res.json({
            success: true,
            lesson: lessonInfo[0],
            activitiesByType,
            activityTypes
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get a single activity by ID
 * GET /api/activities/:activityId
 */
// router.get('/:activityId', async (req, res, next) => {
//     try {
//         const { activityId } = req.params;
        
//         const [activities] = await pool.query(`
//             SELECT 
//                 id, title, type, description, difficulty, image_path, colors,
//                 estimated_duration, max_attempts, passing_score, status,
//                 lesson_id, unit_id, book_id, grade_id
//             FROM activities 
//             WHERE id = ? AND status = 'active'
//         `, [activityId]);
        
//         if (activities.length === 0) {
//             return res.status(404).json({ error: 'Activity not found' });
//         }
        
//         const activity = processActivityForResponse(activities[0]);
        
//         res.json({
//             success: true,
//             activity: activity
//         });
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;