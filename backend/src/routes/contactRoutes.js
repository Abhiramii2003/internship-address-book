const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContact } = require('../middlewares/validator');

router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContactById);
router.post('/', validateContact, contactController.createContact);
router.put('/:id', validateContact, contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
