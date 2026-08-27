const db = require('../config/db');

class Contact {
  // Get paginated and searchable contacts
  static async findAll({ page = 1, limit = 20, search = '' }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT c.*, GROUP_CONCAT(t.name) as tags, GROUP_CONCAT(t.id) as tag_ids
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
    `;
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
    `;
    const queryParams = [];
    const countParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const searchCondition = `
        WHERE c.first_name LIKE ? 
        OR c.last_name LIKE ? 
        OR c.email LIKE ? 
        OR c.phone LIKE ? 
        OR t.name LIKE ?
      `;
      query += searchCondition;
      countQuery += searchCondition;
      const searchFields = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
      queryParams.push(...searchFields);
      countParams.push(...searchFields);
    }

    query += `
      GROUP BY c.id
      ORDER BY c.last_name ASC, c.first_name ASC
      LIMIT ? OFFSET ?
    `;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, queryParams);
    const [countRows] = await db.query(countQuery, countParams);
    
    // Parse tags back into arrays
    const formattedRows = rows.map(row => {
      const contact = { ...row };
      if (contact.tags) {
        contact.tags = contact.tags.split(',').map((name, idx) => ({
          id: parseInt(contact.tag_ids.split(',')[idx]),
          name
        }));
      } else {
        contact.tags = [];
      }
      delete contact.tag_ids;
      return contact;
    });

    return {
      contacts: formattedRows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }

  // Get contact by ID
  static async findById(id) {
    const [rows] = await db.query(`
      SELECT c.*, GROUP_CONCAT(t.name) as tags, GROUP_CONCAT(t.id) as tag_ids
      FROM contacts c
      LEFT JOIN contact_tags ct ON c.id = ct.contact_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (rows.length === 0) return null;

    const contact = rows[0];
    if (contact.tags) {
      contact.tags = contact.tags.split(',').map((name, idx) => ({
        id: parseInt(contact.tag_ids.split(',')[idx]),
        name
      }));
    } else {
      contact.tags = [];
    }
    delete contact.tag_ids;
    return contact;
  }

  // Create a contact with tags within a transaction
  static async create(contactData, tagIds = []) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        first_name, last_name, email, phone,
        address_line1, address_line2, city, state,
        country, postal_code, company_name, notes
      } = contactData;

      const [result] = await connection.query(`
        INSERT INTO contacts 
        (first_name, last_name, email, phone, address_line1, address_line2, city, state, country, postal_code, company_name, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        first_name, last_name, email || null, phone || null,
        address_line1 || null, address_line2 || null, city || null, state || null,
        country || null, postal_code || null, company_name || null, notes || null
      ]);

      const contactId = result.insertId;

      if (tagIds && tagIds.length > 0) {
        const tagValues = tagIds.map(tagId => [contactId, tagId]);
        await connection.query(`
          INSERT INTO contact_tags (contact_id, tag_id) VALUES ?
        `, [tagValues]);
      }

      await connection.commit();
      return contactId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update a contact and its tags within a transaction
  static async update(id, contactData, tagIds = []) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        first_name, last_name, email, phone,
        address_line1, address_line2, city, state,
        country, postal_code, company_name, notes
      } = contactData;

      await connection.query(`
        UPDATE contacts 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, 
            address_line1 = ?, address_line2 = ?, city = ?, state = ?, 
            country = ?, postal_code = ?, company_name = ?, notes = ?
        WHERE id = ?
      `, [
        first_name, last_name, email || null, phone || null,
        address_line1 || null, address_line2 || null, city || null, state || null,
        country || null, postal_code || null, company_name || null, notes || null,
        id
      ]);

      // Update tags: simplest way is to delete existing and re-insert
      await connection.query(`DELETE FROM contact_tags WHERE contact_id = ?`, [id]);

      if (tagIds && tagIds.length > 0) {
        const tagValues = tagIds.map(tagId => [id, tagId]);
        await connection.query(`
          INSERT INTO contact_tags (contact_id, tag_id) VALUES ?
        `, [tagValues]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Delete contact (cascade handles contact_tags)
  static async delete(id) {
    const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Contact;
