const { validationResult } = require('express-validator');

// Middleware para validar campos en las solicitudes
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRequest
};
