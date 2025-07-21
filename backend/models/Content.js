const pool = require('./db');

class Content {
    static async create(title, type, description, status) {
        const [result] = await pool.query(
            'INSERT INTO content (title, type, description, status) VALUES (?, ?, ?, ?)',
            [title, type, description, status]
        );
        return result.insertId;
    }

    static async addFile(contentId, fileName, filePath, fileType, fileSize) {
        const [result] = await pool.query(
            'INSERT INTO files (content_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
            [contentId, fileName, filePath, fileType, fileSize]
        );
        return result.insertId;
    }

    static async updateThumbnail(contentId, thumbnailId) {
        await pool.query('UPDATE content SET thumbnail_id = ? WHERE id = ?', [thumbnailId, contentId]);
    }

    static async findByType(type) {
        const [rows] = await pool.query(
            'SELECT c.*, f.file_path as thumbnail_path FROM content c LEFT JOIN files f ON c.thumbnail_id = f.id WHERE c.type = ? ORDER BY c.created_at DESC',
            [type]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT c.*, f.file_path as thumbnail_path FROM content c LEFT JOIN files f ON c.thumbnail_id = f.id WHERE c.id = ?',
            [id]
        );
        return rows[0];
    }
}

module.exports = Content;
