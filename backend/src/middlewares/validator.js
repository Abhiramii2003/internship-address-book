const { validationResult, body } = require('express-validator');

// Custom flexible phone validator: Allows digits, spaces, dashes, plus sign, parenthesis
const isFlexiblePhone = (value) => {
  if (!value) return true; // It's handled by another check if required
  const phoneRegex = /^[0-9\+\-\(\)\s]{7,20}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Invalid phone number format');
  }
  return true;
};

const commonContactValidations = [
  body('email').optional({ values: 'null' }).custom((value) => {
    if (value === '' || value === null) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) throw new Error('Must be a valid email address');
    return true;
  }),
  body('phone').optional({ values: 'null' }).custom((value) => {
    if (value === '' || value === null) return true;
    return isFlexiblePhone(value);
  }),
  body('tagIds')
    .optional()
    .isArray().withMessage('tagIds must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        for (const tagId of value) {
          if (!Number.isInteger(tagId) || tagId <= 0) {
            throw new Error('Each tagId must be a positive integer');
          }
        }
      }
      return true;
    })
];

const validateCreateContact = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('At least one of email or phone is required');
    }
    return true;
  }),
  ...commonContactValidations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateUpdateContact = [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  ...commonContactValidations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateTag = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCreateContact,
  validateUpdateContact,
  validateTag
};
