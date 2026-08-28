const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateCreateContact, validateUpdateContact } = require('../middlewares/validator');

router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContactById);
router.post('/', validateCreateContact, contactController.createContact);
router.put('/:id', validateUpdateContact, contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
