const db = require('../config/db');

class Tag {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  }

  static async create(name) {
    const [result] = await db.query('INSERT INTO tags (name) VALUES (?)', [name]);
    return result.insertId;
  }

  static async findByName(name) {
    const [rows] = await db.query('SELECT * FROM tags WHERE name = ?', [name]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM tags WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Tag;
