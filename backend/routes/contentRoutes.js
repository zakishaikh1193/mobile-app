const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const Content = require('../models/Content');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', contentController.getAllContent);
router.post('/', contentController.createContent);
router.delete('/:id', contentController.deleteContent);
router.put('/:id', contentController.updateContent);

// Create new content
router.post('/create', upload.fields([
    { name: 'contentFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, type, description, status } = req.body;
        
        // First create the content
        const contentId = await Content.create(title, type, description, status);

        // Handle thumbnail upload
        let thumbnailId = null;
        if (req.files && req.files.thumbnail) {
            const thumbnail = req.files.thumbnail[0];
            thumbnailId = await Content.addFile(
                contentId,
                thumbnail.originalname,
                thumbnail.path,
                'image',
                thumbnail.size
            );
        }

        // Update content with thumbnail ID
        if (thumbnailId) {
            await Content.updateThumbnail(contentId, thumbnailId);
        }

        // Handle content file upload
        if (req.files && req.files.contentFile) {
            const contentFile = req.files.contentFile[0];
            await Content.addFile(
                contentId,
                contentFile.originalname,
                contentFile.path,
                contentFile.mimetype.split('/')[0],
                contentFile.size
            );
        }

        res.status(201).json({ message: 'Content created successfully', contentId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all content by type
router.get('/type/:type', async (req, res) => {
    try {
        const content = await Content.findByType(req.params.type);
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single content
router.get('/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
module.exports = router; 