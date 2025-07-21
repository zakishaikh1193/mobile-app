const pool = require('../models/db');
const path = require('path');

exports.getAllContent = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM content_library ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { title, type, description, status } = req.body;
    let file_url = null, thumbnail_url = null;

    // Handle file upload
    if (req.files?.file) {
      const file = req.files.file;
      const filePath = `uploads/${Date.now()}_${file.name}`;
      await file.mv(filePath);
      file_url = filePath;
    }
    if (req.files?.thumbnail) {
      const thumb = req.files.thumbnail;
      const thumbPath = `uploads/${Date.now()}_${thumb.name}`;
      await thumb.mv(thumbPath);
      thumbnail_url = thumbPath;
    }

    const [result] = await pool.query(
      'INSERT INTO content_library (title, type, description, status, file_url, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, type, description, status, file_url, thumbnail_url]
    );
    res.json({ id: result.insertId, title, type, description, status, file_url, thumbnail_url });
  } catch (err) {
    console.error('Error creating content:', err);
    res.status(500).json({ error: 'Failed to create content' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM content_library WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting content:', err);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, description, status } = req.body;
    await pool.query(
      'UPDATE content_library SET title=?, type=?, description=?, status=? WHERE id=?',
      [title, type, description, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating content:', err);
    res.status(500).json({ error: 'Failed to update content' });
  }
}; 