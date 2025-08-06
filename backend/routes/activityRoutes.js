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
    return {
        ...activity,
        image_url: activity.image_path ? `/${activity.image_path.replace(/\\/g, '/')}` : null,
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
        res.json(processActivityForResponse(rows[0]));
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


module.exports = router;