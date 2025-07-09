const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getBooks, getBookById, createBook, updateBook, deleteBook, getBookStats } = require('../controllers/books');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validations');

// @ruta    GET api/books
// @desc    Obtener todos los libros
// @acceso  Privado
router.get('/', auth, getBooks);

// @ruta    GET api/books/stats
// @desc    Obtener estadísticas de los libros
// @acceso  Privado
router.get('/stats', auth, getBookStats);

// @ruta    GET api/books/:id
// @desc    Obtener un libro por ID
// @acceso  Privado
router.get('/:id', auth, getBookById);

// @ruta    POST api/books
// @desc    Crear un nuevo libro
// @acceso  Privado
router.post(
  '/',
  [
    auth,
    check('title', 'El título es requerido').not().isEmpty(),
    check('author', 'El autor es requerido').not().isEmpty()
  ],
  validateRequest,
  createBook
);

// @ruta    PUT api/books/:id
// @desc    Actualizar un libro
// @acceso  Privado
router.put(
  '/:id',
  [
    auth,
    check('title', 'El título es requerido si se proporciona').optional().not().isEmpty(),
    check('author', 'El autor es requerido si se proporciona').optional().not().isEmpty(),
    check('stock', 'El stock debe ser un número si se proporciona').optional().isNumeric(),
    check('sold', 'Los vendidos deben ser un número si se proporciona').optional().isNumeric(),
    check('consignadosVendidos', 'Los consignados vendidos deben ser un número si se proporciona').optional().isNumeric(),
    check('consignadosNoVendidos', 'Los consignados no vendidos deben ser un número si se proporciona').optional().isNumeric(),
    check('promocionales', 'Los promocionales deben ser un número si se proporciona').optional().isNumeric(),
    check('regalados', 'Los regalados deben ser un número si se proporciona').optional().isNumeric()
  ],
  validateRequest,
  updateBook
);

// @ruta    DELETE api/books/:id
// @desc    Eliminar un libro
// @acceso  Privado
router.delete('/:id', auth, deleteBook);

module.exports = router;
