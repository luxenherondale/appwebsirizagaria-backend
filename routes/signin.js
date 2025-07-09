const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { login, register, getMe } = require('../controllers/signin');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validations');

// @ruta    POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @acceso  Público
router.post(
  '/login',
  [
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'La contraseña es requerida').exists()
  ],
  validateRequest,
  login
);

// @ruta    POST api/auth/register
// @desc    Registrar un nuevo usuario
// @acceso  Público
router.post(
  '/register',
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 })
  ],
  validateRequest,
  register
);

// @ruta    GET api/auth/me
// @desc    Obtener usuario autenticado
// @acceso  Privado
router.get('/me', auth, getMe);

module.exports = router;
