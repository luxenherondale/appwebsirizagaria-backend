const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getBooks, getBookById, createBook, updateBook, deleteBook, getBookStats, uploadCover, lookupISBN } = require('../controllers/books');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validations');

// Configure multer for image uploads
const uploadsDir = path.join(__dirname, '..', 'uploads', 'covers');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

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

// @ruta    POST api/books/upload-cover
// @desc    Subir imagen de portada
// @acceso  Privado
router.post('/upload-cover', auth, upload.single('cover'), uploadCover);

// @ruta    GET api/books/isbn/:isbn
// @desc    Buscar información de libro por ISBN
// @acceso  Privado
router.get('/isbn/:isbn', auth, lookupISBN);

module.exports = router;
