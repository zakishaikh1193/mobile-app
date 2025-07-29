const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../models/db');

// Configure multer for activity content uploads
const UPLOAD_PATH = path.join(__dirname, '..', 'uploads', 'activities');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(UPLOAD_PATH)) {
                fs.mkdirSync(UPLOAD_PATH, { recursive: true });
            }
            cb(null, UPLOAD_PATH);
        } catch (error) {
            console.error("Error creating upload directory:", error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) { cb(null, true); } 
        else { cb(new Error('Only image files are allowed!'), false); }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});
const getRelativePath = (fullPath) => {
    return path.join('uploads', 'activities', path.basename(fullPath)).replace(/\\/g, '/');
}

// Helper function to process activity data for response
const processActivityForResponse = (activity) => {
    if (!activity) return null;

    let parsedColors = [];
    if (activity.colors) {
        try {
            // The database stores JSON, so it should already be parsed by the driver.
            // If it's a string, we parse it.
            parsedColors = typeof activity.colors === 'string' 
                ? JSON.parse(activity.colors) 
                : activity.colors;
        } catch (e) {
            // Fallback for malformed strings
            parsedColors = activity.colors.split(',').map(c => c.trim());
        }
    }
    
    return {
        ...activity,
        // CHANGE: Generate the full URL path on the backend.
        // The path stored in the DB is like 'uploads/activities/image-123.png'.
        // The client needs a URL like '/uploads/activities/image-123.png'.
        image_url: activity.image_path ? `/${activity.image_path.replace(/\\/g, '/')}` : null,
        colors: parsedColors,
    };
};

// Create new activity content
router.post('/create', upload.single('image'), async (req, res) => {
    try {
        const { title, type, description, difficulty, colors } = req.body;
        
        if (!title || !type || !description) {
            return res.status(400).json({ error: 'Title, type, and description are required.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required for new activities.' });
        }

        let parsedColors = colors ? JSON.parse(colors) : [];
        const imageDbPath = getRelativePath(req.file.path);

        const [result] = await pool.query(
            `INSERT INTO activities (title, type, description, difficulty, image_path, colors, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
            [title, type, description, difficulty || 'easy', imageDbPath, JSON.stringify(parsedColors)]
        );

        res.status(201).json({ 
            message: 'Activity created successfully', 
            activityId: result.insertId
        });
    } catch (error) {
        console.error('Error creating activity:', error);
        if (req.file) { fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting orphaned file:", err); }); }
        res.status(500).json({ error: error.message });
    }
});
// Get all activities (combined logic)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query; // CHANGE: Use query param for filtering
        let query = 'SELECT * FROM activities WHERE status = "active"';
        let params = [];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        query += ' ORDER BY type, created_at DESC';

        const [rows] = await pool.query(query, params);
        
        const activities = rows.map(processActivityForResponse);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: error.message });
    }
});

// CHANGE: Deprecate /type/:type in favor of /?type=coloring for consistency
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM activities WHERE type = ? AND status = "active" ORDER BY created_at DESC',
            [type]
        );
        const activities = rows.map(processActivityForResponse);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Get single activity
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM activities WHERE id = ? AND status = "active"',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        const activity = processActivityForResponse(rows[0]);
        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', upload.any(), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, colors } = req.body;

        // The file, if it exists, will now be in req.files array
        const newFile = req.files && req.files.length > 0 ? req.files[0] : null;

        const [existingRows] = await pool.query('SELECT image_path FROM activities WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            // If activity not found, delete the uploaded file if it exists
            if (newFile) fs.unlinkSync(newFile.path); 
            return res.status(404).json({ error: 'Activity not found' });
        }
        const oldImagePath = existingRows[0].image_path;

        let updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (difficulty) updateFields.difficulty = difficulty;
        if (colors) updateFields.colors = JSON.stringify(JSON.parse(colors));
        
        // If a new file was uploaded, update the path and delete the old file
        if (newFile) {
            updateFields.image_path = getRelativePath(newFile.path);
            if (oldImagePath) {
                const fullOldPath = path.join(__dirname, '..', oldImagePath);
                if (fs.existsSync(fullOldPath)) {
                    fs.unlink(fullOldPath, err => {
                        if (err) console.error("Error deleting old image:", err);
                    });
                }
            }
        }
        
        // Check if there is anything to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updateFields), id];

        await pool.query(
            `UPDATE activities SET ${setClause}, updated_at = NOW() WHERE id = ?`,
            values
        );

        res.json({ message: 'Activity updated successfully' });
    } catch (error) {
        console.error('Error updating activity:', error);
        // Clean up orphaned file on error
        const newFile = req.files && req.files.length > 0 ? req.files[0] : null;
        if (newFile) { 
            fs.unlink(newFile.path, (err) => { 
                if (err) console.error("Error deleting orphaned file on update:", err); 
            }); 
        }
        res.status(500).json({ error: error.message });
    }
});


// Delete activity (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query(
            'UPDATE activities SET status = "deleted", updated_at = NOW() WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;