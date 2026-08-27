const Tag = require('../models/Tag');

exports.getTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    // Check if exists
    const existing = await Tag.findByName(name);
    if (existing) {
      return res.status(409).json({ error: 'Tag already exists' });
    }

    const tagId = await Tag.create(name);
    res.status(201).json({ id: tagId, name });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Tag already exists' });
    }
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const deleted = await Tag.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
