const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { validateTag } = require('../middlewares/validator');

router.get('/', tagController.getTags);
router.post('/', validateTag, tagController.createTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
