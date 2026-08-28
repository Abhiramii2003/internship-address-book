const db = require('../config/db');

class Contact {
  // Get paginated and searchable contacts
  static async findAll({ page = 1, limit = 20, search = '' }) {
    const offset = (page - 1) * limit;
    
    let baseQuery = `
      SELECT c.*, o.legal_name, o.display_name as org_display_name
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE c.deleted_at IS NULL AND c.is_active = 1
    `;
    
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
    `;
    let countWhere = `WHERE c.deleted_at IS NULL AND c.is_active = 1`;
    const queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const searchCondition = `
        AND (
          c.first_name LIKE ? OR c.middle_name LIKE ? OR c.last_name LIKE ? OR c.display_name LIKE ?
          OR c.job_title LIKE ? OR c.department LIKE ? OR c.notes LIKE ?
          OR o.legal_name LIKE ? OR o.display_name LIKE ?
          OR EXISTS (SELECT 1 FROM contact_emails ce WHERE ce.contact_id = c.id AND ce.email LIKE ?)
          OR EXISTS (SELECT 1 FROM contact_phones cp WHERE cp.contact_id = c.id AND cp.phone_number LIKE ?)
          OR EXISTS (SELECT 1 FROM contact_category_map ccm JOIN categories cat ON ccm.category_id = cat.id WHERE ccm.contact_id = c.id AND cat.name LIKE ?)
        )
      `;
      baseQuery += searchCondition;
      countWhere += searchCondition;
      const searchFields = Array(12).fill(searchPattern);
      queryParams.push(...searchFields);
    }

    baseQuery += ` ORDER BY c.display_name ASC LIMIT ? OFFSET ?`;
    
    const [rows] = await db.query(baseQuery, [...queryParams, parseInt(limit), parseInt(offset)]);
    const [countRows] = await db.query(countQuery + ' ' + countWhere, queryParams);

    if (rows.length === 0) {
      return {
        contacts: [],
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      };
    }

    const contactIds = rows.map(r => r.id);

    // Fetch related normalized tables
    const [emails] = await db.query(`SELECT * FROM contact_emails WHERE contact_id IN (?)`, [contactIds]);
    const [phones] = await db.query(`SELECT * FROM contact_phones WHERE contact_id IN (?)`, [contactIds]);
    const [addresses] = await db.query(`SELECT * FROM contact_addresses WHERE contact_id IN (?)`, [contactIds]);
    const [categories] = await db.query(`
      SELECT ccm.contact_id, cat.id, cat.name 
      FROM contact_category_map ccm 
      JOIN categories cat ON ccm.category_id = cat.id 
      WHERE ccm.contact_id IN (?)
    `, [contactIds]);

    const formattedRows = rows.map(row => {
      const contactEmails = emails.filter(e => e.contact_id === row.id);
      const contactPhones = phones.filter(p => p.contact_id === row.id);
      const contactAddresses = addresses.filter(a => a.contact_id === row.id);
      const contactCategories = categories.filter(c => c.contact_id === row.id);

      const primaryEmail = contactEmails.find(e => e.is_primary) || contactEmails[0];
      const primaryPhone = contactPhones.find(p => p.is_primary) || contactPhones[0];
      const primaryAddress = contactAddresses.find(a => a.is_primary) || contactAddresses[0];

      return {
        ...row,
        email: primaryEmail ? primaryEmail.email : null,
        phone: primaryPhone ? (primaryPhone.country_code === '+91' ? primaryPhone.phone_number : primaryPhone.country_code + primaryPhone.phone_number) : null,
        address_line1: primaryAddress ? primaryAddress.address_line1 : null,
        address_line2: primaryAddress ? primaryAddress.address_line2 : null,
        city: primaryAddress ? primaryAddress.city : null,
        state: primaryAddress ? primaryAddress.state : null,
        country: primaryAddress ? primaryAddress.country : null,
        postal_code: primaryAddress ? primaryAddress.postal_code : null,
        company_name: row.org_display_name || row.legal_name || null,
        tags: contactCategories.map(c => ({ id: c.id, name: c.name })),
        tagIds: contactCategories.map(c => c.id),
        
        emails: contactEmails,
        phones: contactPhones,
        addresses: contactAddresses
      };
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
      SELECT c.*, o.legal_name, o.display_name as org_display_name
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE c.id = ? AND c.deleted_at IS NULL AND c.is_active = 1
    `, [id]);

    if (rows.length === 0) return null;

    const row = rows[0];
    
    const [emails] = await db.query(`SELECT * FROM contact_emails WHERE contact_id = ?`, [id]);
    const [phones] = await db.query(`SELECT * FROM contact_phones WHERE contact_id = ?`, [id]);
    const [addresses] = await db.query(`SELECT * FROM contact_addresses WHERE contact_id = ?`, [id]);
    const [categories] = await db.query(`
      SELECT ccm.contact_id, cat.id, cat.name 
      FROM contact_category_map ccm 
      JOIN categories cat ON ccm.category_id = cat.id 
      WHERE ccm.contact_id = ?
    `, [id]);

    const primaryEmail = emails.find(e => e.is_primary) || emails[0];
    const primaryPhone = phones.find(p => p.is_primary) || phones[0];
    const primaryAddress = addresses.find(a => a.is_primary) || addresses[0];

    return {
      ...row,
      email: primaryEmail ? primaryEmail.email : null,
      phone: primaryPhone ? (primaryPhone.country_code === '+91' ? primaryPhone.phone_number : primaryPhone.country_code + primaryPhone.phone_number) : null,
      address_line1: primaryAddress ? primaryAddress.address_line1 : null,
      address_line2: primaryAddress ? primaryAddress.address_line2 : null,
      city: primaryAddress ? primaryAddress.city : null,
      state: primaryAddress ? primaryAddress.state : null,
      country: primaryAddress ? primaryAddress.country : null,
      postal_code: primaryAddress ? primaryAddress.postal_code : null,
      company_name: row.org_display_name || row.legal_name || null,
      tags: categories.map(c => ({ id: c.id, name: c.name })),
      tagIds: categories.map(c => c.id),
      
      emails,
      phones,
      addresses
    };
  }

  // Create a contact within a transaction
  static async create(contactData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        first_name, last_name, email, phone,
        address_line1, address_line2, city, state,
        country, postal_code, company_name, notes, tagIds
      } = contactData;

      let organization_id = null;
      if (company_name !== undefined) {
        if (company_name === null || company_name.trim() === '') {
            organization_id = null;
        } else {
            const cleanOrgName = company_name.trim();
            await connection.query(`
              INSERT INTO organizations (legal_name, display_name) 
              VALUES (?, ?) 
              ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
            `, [cleanOrgName, cleanOrgName]);
            
            const [orgRows] = await connection.query(`SELECT id FROM organizations WHERE legal_name = ? LIMIT 1`, [cleanOrgName]);
            if (orgRows.length > 0) {
              organization_id = orgRows[0].id;
            }
        }
      }

      const display_name = [first_name, last_name].filter(Boolean).join(' ');

      const [result] = await connection.query(`
        INSERT INTO contacts 
        (first_name, last_name, display_name, organization_id, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [
        first_name, last_name || null, display_name, organization_id, notes || null
      ]);

      const contactId = result.insertId;

      if (email !== undefined) {
          if (email !== null && email.trim() !== '') {
              await connection.query(`INSERT INTO contact_emails (contact_id, email, is_primary) VALUES (?, ?, 1)`, [contactId, email.trim()]);
          }
      }

      if (phone !== undefined) {
          if (phone !== null && phone.trim() !== '') {
              let cleanPhone = phone.trim().replace(/[^\d+]/g, '');
              let countryCode = '+91';
              let number = cleanPhone;
              
              if (cleanPhone.startsWith('+')) {
                  const countryMatch = cleanPhone.match(/^(\+\d{1,3})(\d+)$/);
                  if (countryMatch) {
                      if (cleanPhone.startsWith('+91')) {
                          countryCode = '+91';
                          number = cleanPhone.substring(3);
                      } else if (cleanPhone.startsWith('+1')) {
                          countryCode = '+1';
                          number = cleanPhone.substring(2);
                      } else if (cleanPhone.startsWith('+44')) {
                          countryCode = '+44';
                          number = cleanPhone.substring(3);
                      } else {
                          countryCode = countryMatch[1];
                          number = countryMatch[2];
                      }
                  } else {
                      number = cleanPhone.replace('+', ''); 
                  }
              } else if (cleanPhone.length > 10) {
                  countryCode = '+' + cleanPhone.substring(0, cleanPhone.length - 10);
                  number = cleanPhone.substring(cleanPhone.length - 10);
              }
              
              await connection.query(`INSERT INTO contact_phones (contact_id, country_code, phone_number, is_primary) VALUES (?, ?, ?, 1)`, [contactId, countryCode, number]);
          }
      }

      if (address_line1 !== undefined) {
          if (address_line1 !== null && address_line1.trim() !== '') {
              await connection.query(`
                  INSERT INTO contact_addresses (contact_id, address_line1, address_line2, city, state, country, postal_code, is_primary) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
              `, [contactId, address_line1.trim(), address_line2 || null, city || null, state || null, country || 'India', postal_code || null]);
          }
      }

      if (tagIds !== undefined) {
        if (tagIds && tagIds.length > 0) {
          const tagValues = tagIds.map(tagId => [contactId, tagId]);
          await connection.query(`
            INSERT INTO contact_category_map (contact_id, category_id) VALUES ?
          `, [tagValues]);
        }
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

  // Update a contact within a transaction
  static async update(id, contactData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        first_name, last_name, email, phone,
        address_line1, address_line2, city, state,
        country, postal_code, company_name, notes, tagIds
      } = contactData;

      const [currentContacts] = await connection.query('SELECT * FROM contacts WHERE id = ?', [id]);
      if (currentContacts.length === 0) {
          throw new Error('Contact not found');
      }
      const currentContact = currentContacts[0];

      const newFirstName = first_name !== undefined ? first_name : currentContact.first_name;
      const newLastName = last_name !== undefined ? last_name : currentContact.last_name;
      const display_name = [newFirstName, newLastName].filter(Boolean).join(' ');

      let organization_id = currentContact.organization_id;
      if (company_name !== undefined) {
        if (company_name === null || company_name.trim() === '') {
            organization_id = null;
        } else {
            const cleanOrgName = company_name.trim();
            await connection.query(`
              INSERT INTO organizations (legal_name, display_name) 
              VALUES (?, ?) 
              ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
            `, [cleanOrgName, cleanOrgName]);
            
            const [orgRows] = await connection.query(`SELECT id FROM organizations WHERE legal_name = ? LIMIT 1`, [cleanOrgName]);
            if (orgRows.length > 0) {
              organization_id = orgRows[0].id;
            }
        }
      }

      const newNotes = notes !== undefined ? (notes || null) : currentContact.notes;

      await connection.query(`
        UPDATE contacts 
        SET first_name = ?, last_name = ?, display_name = ?, organization_id = ?, notes = ?
        WHERE id = ?
      `, [
        newFirstName, newLastName || null, display_name, organization_id, newNotes, id
      ]);

      if (email !== undefined) {
          if (email === null || email.trim() === '') {
              // Delete primary email
              await connection.query(`DELETE FROM contact_emails WHERE contact_id = ? AND is_primary = 1`, [id]);
          } else {
              const [existingEmails] = await connection.query(`SELECT id FROM contact_emails WHERE contact_id = ? AND is_primary = 1`, [id]);
              if (existingEmails.length > 0) {
                 await connection.query(`UPDATE contact_emails SET email = ? WHERE id = ?`, [email.trim(), existingEmails[0].id]);
              } else {
                 await connection.query(`INSERT INTO contact_emails (contact_id, email, is_primary) VALUES (?, ?, 1)`, [id, email.trim()]);
              }
          }
      }

      if (phone !== undefined) {
          if (phone === null || phone.trim() === '') {
              // Delete primary phone
              await connection.query(`DELETE FROM contact_phones WHERE contact_id = ? AND is_primary = 1`, [id]);
          } else {
              let cleanPhone = phone.trim().replace(/[^\d+]/g, '');
              let countryCode = '+91';
              let number = cleanPhone;
              
              if (cleanPhone.startsWith('+')) {
                  const countryMatch = cleanPhone.match(/^(\+\d{1,3})(\d+)$/);
                  if (countryMatch) {
                      if (cleanPhone.startsWith('+91')) {
                          countryCode = '+91';
                          number = cleanPhone.substring(3);
                      } else if (cleanPhone.startsWith('+1')) {
                          countryCode = '+1';
                          number = cleanPhone.substring(2);
                      } else if (cleanPhone.startsWith('+44')) {
                          countryCode = '+44';
                          number = cleanPhone.substring(3);
                      } else {
                          countryCode = countryMatch[1];
                          number = countryMatch[2];
                      }
                  } else {
                      number = cleanPhone.replace('+', ''); 
                  }
              } else if (cleanPhone.length > 10) {
                  countryCode = '+' + cleanPhone.substring(0, cleanPhone.length - 10);
                  number = cleanPhone.substring(cleanPhone.length - 10);
              }

              const [existingPhones] = await connection.query(`SELECT id FROM contact_phones WHERE contact_id = ? AND is_primary = 1`, [id]);
              if (existingPhones.length > 0) {
                 await connection.query(`UPDATE contact_phones SET country_code = ?, phone_number = ? WHERE id = ?`, [countryCode, number, existingPhones[0].id]);
              } else {
                 await connection.query(`INSERT INTO contact_phones (contact_id, country_code, phone_number, is_primary) VALUES (?, ?, ?, 1)`, [id, countryCode, number]);
              }
          }
      }

      if (address_line1 !== undefined) {
          if (address_line1 === null || address_line1.trim() === '') {
              await connection.query(`DELETE FROM contact_addresses WHERE contact_id = ? AND is_primary = 1`, [id]);
          } else {
              const [existingAddresses] = await connection.query(`SELECT id FROM contact_addresses WHERE contact_id = ? AND is_primary = 1`, [id]);
              if (existingAddresses.length > 0) {
                  await connection.query(`
                      UPDATE contact_addresses 
                      SET address_line1 = ?, address_line2 = ?, city = ?, state = ?, country = ?, postal_code = ? 
                      WHERE id = ?
                  `, [address_line1.trim(), address_line2 || null, city || null, state || null, country || 'India', postal_code || null, existingAddresses[0].id]);
              } else {
                  await connection.query(`
                      INSERT INTO contact_addresses (contact_id, address_line1, address_line2, city, state, country, postal_code, is_primary) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                  `, [id, address_line1.trim(), address_line2 || null, city || null, state || null, country || 'India', postal_code || null]);
              }
          }
      }

      if (tagIds !== undefined) {
        await connection.query(`DELETE FROM contact_category_map WHERE contact_id = ?`, [id]);
        
        if (tagIds && tagIds.length > 0) {
          const tagValues = tagIds.map(tagId => [id, tagId]);
          await connection.query(`
            INSERT INTO contact_category_map (contact_id, category_id) VALUES ?
          `, [tagValues]);
        }
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

  // Soft delete contact
  static async delete(id) {
    const [result] = await db.query('UPDATE contacts SET deleted_at = CURRENT_TIMESTAMP, is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Contact;
