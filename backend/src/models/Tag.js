const db = require('../config/db');

class Tag {
  // Get active categories
  static async findAll() {
    const [rows] = await db.query(`
      SELECT *
      FROM categories
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    return rows;
  }

  // Create a category
  static async create(name) {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const [result] = await db.query(`
      INSERT INTO categories
        (name, slug)
      VALUES (?, ?)
    `, [name.trim(), slug]);

    return result.insertId;
  }

  // Find category by name
  static async findByName(name) {
    const [rows] = await db.query(`
      SELECT *
      FROM categories
      WHERE name = ?
      LIMIT 1
    `, [name.trim()]);

    return rows.length > 0 ? rows[0] : null;
  }

  // Delete category
  static async delete(id) {
    const [result] = await db.query(`
      UPDATE categories
      SET is_active = 0
      WHERE id = ?
        AND is_system = 0
    `, [id]);

    return result.affectedRows > 0;
  }
}

module.exports = Tag;
