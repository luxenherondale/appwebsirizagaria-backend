const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getExpenses, getExpenseStats, getExpenseById, createExpense, updateExpense, deleteExpense } = require('../controllers/expenses');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validations');

// @ruta    GET api/expenses
// @desc    Obtener todos los gastos
// @acceso  Privado
router.get('/', auth, getExpenses);

// @ruta    GET api/expenses/stats
// @desc    Obtener estadísticas de gastos
// @acceso  Privado
router.get('/stats', auth, getExpenseStats);

// @ruta    GET api/expenses/:id
// @desc    Obtener un gasto por ID
// @acceso  Privado
router.get('/:id', auth, getExpenseById);

// @ruta    POST api/expenses
// @desc    Crear un nuevo gasto
// @acceso  Privado
router.post(
  '/',
  [
    auth,
    check('concept', 'El concepto es requerido').not().isEmpty(),
    check('amount', 'El monto es requerido y debe ser un número').isNumeric(),
    check('category', 'La categoría es requerida').not().isEmpty(),
    check('type', 'El tipo debe ser ingreso o gasto').isIn(['ingreso', 'gasto'])
  ],
  validateRequest,
  createExpense
);

// @ruta    PUT api/expenses/:id
// @desc    Actualizar un gasto
// @acceso  Privado
router.put(
  '/:id',
  [
    auth,
    check('concept', 'El concepto es requerido si se proporciona').optional().not().isEmpty(),
    check('amount', 'El monto debe ser un número si se proporciona').optional().isNumeric(),
    check('category', 'La categoría es requerida si se proporciona').optional().not().isEmpty(),
    check('type', 'El tipo debe ser ingreso o gasto si se proporciona').optional().isIn(['ingreso', 'gasto'])
  ],
  validateRequest,
  updateExpense
);

// @ruta    DELETE api/expenses/:id
// @desc    Eliminar un gasto
// @acceso  Privado
router.delete('/:id', auth, deleteExpense);

module.exports = router;
