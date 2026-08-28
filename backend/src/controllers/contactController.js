const Contact = require('../models/Contact');

exports.getContacts = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const data = await Contact.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || ''
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

exports.createContact = async (req, res, next) => {
  try {
    const contactId = await Contact.create(req.body);
    const newContact = await Contact.findById(contactId);
    res.status(201).json(newContact);
  } catch (error) {
    if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
      return res.status(400).json({ error: 'At least one of email or phone is required.' });
    }
    if (error.code === 'ER_TABLEACCESS_DENIED_ERROR') {
      return res.status(403).json({ error: 'This operation requires elevated database permissions that are currently unavailable.' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This email or phone number is already in use by another contact.' });
    }
    next(error);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const existing = await Contact.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    await Contact.update(req.params.id, req.body);
    const updatedContact = await Contact.findById(req.params.id);
    res.json(updatedContact);
  } catch (error) {
    if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
      return res.status(400).json({ error: 'At least one of email or phone is required.' });
    }
    if (error.code === 'ER_TABLEACCESS_DENIED_ERROR') {
      return res.status(403).json({ error: 'This operation requires elevated database permissions that are currently unavailable.' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This email or phone number is already in use by another contact.' });
    }
    next(error);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const deleted = await Contact.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === 'ER_TABLEACCESS_DENIED_ERROR') {
      return res.status(403).json({ error: 'This operation requires elevated database permissions that are currently unavailable.' });
    }
    next(error);
  }
};
