const mongoose = require('mongoose');

// Esquema para el modelo de gastos/transacciones
const ExpenseSchema = new mongoose.Schema({
  concept: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ingreso', 'gasto']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Para entorno de desarrollo sin MongoDB, también exportamos un array de gastos
const expenses = [
  {
    id: "1",
    concept: "Venta de libros",
    amount: 150000,
    date: new Date(),
    category: "Ventas",
    type: "ingreso",
    createdAt: new Date()
  },
  {
    id: "2",
    concept: "Compra de material",
    amount: 50000,
    date: new Date(),
    category: "Materiales",
    type: "gasto",
    createdAt: new Date()
  },
  {
    id: "3",
    concept: "Pago de servicios",
    amount: 35000,
    date: new Date(),
    category: "Servicios",
    type: "gasto",
    createdAt: new Date()
  }
];

module.exports = {
  Expense: mongoose.model('Expense', ExpenseSchema),
  expenses
};
