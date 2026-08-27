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

const validateContact = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  
  // Custom validation to ensure at least email or phone is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('At least one of email or phone is required');
    }
    return true;
  }),

  // Email validation if provided
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Must be a valid email address'),

  // Phone validation if provided
  body('phone').optional({ checkFalsy: true }).custom(isFlexiblePhone),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateTag = [
  body('name').trim().notEmpty().withMessage('Tag name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateContact,
  validateTag
};
