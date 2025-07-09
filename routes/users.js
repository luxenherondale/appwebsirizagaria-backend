const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/users');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validations');

// @ruta    GET api/users
// @desc    Obtener todos los usuarios
// @acceso  Privado (solo admin)
router.get('/', auth, getUsers);

// @ruta    GET api/users/:id
// @desc    Obtener un usuario por ID
// @acceso  Privado
router.get('/:id', auth, getUserById);

// @ruta    POST api/users
// @desc    Crear un nuevo usuario (solo admin)
// @acceso  Privado
router.post(
  '/',
  [
    auth,
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 }),
    check('role', 'El rol debe ser admin, editor o lector').isIn(['admin', 'editor', 'lector'])
  ],
  validateRequest,
  createUser
);

// @ruta    PUT api/users/:id
// @desc    Actualizar un usuario
// @acceso  Privado
router.put(
  '/:id',
  [
    auth,
    check('name', 'El nombre es requerido si se proporciona').optional().not().isEmpty(),
    check('email', 'Por favor incluye un email válido si se proporciona').optional().isEmail(),
    check('role', 'El rol debe ser admin, editor o lector si se proporciona').optional().isIn(['admin', 'editor', 'lector'])
  ],
  validateRequest,
  updateUser
);

// @ruta    DELETE api/users/:id
// @desc    Eliminar un usuario
// @acceso  Privado (solo admin)
router.delete('/:id', auth, deleteUser);

module.exports = router;
