const { Expense, expenses } = require('../models/expense');
const fs = require('fs');
const path = require('path');

// Obtener todos los gastos
const getExpenses = async (req, res) => {
  try {
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const expenses = await Expense.find();
      return res.json(expenses);
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      return res.json(expenses);
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al obtener gastos: ${err.message}\n`
    );
    
    console.error('Error al obtener gastos:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener estadísticas de gastos
const getExpenseStats = async (req, res) => {
  try {
    let totalIngresos = 0;
    let totalGastos = 0;
    let expensesByCategory = {};
    
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const allExpenses = await Expense.find();
      
      allExpenses.forEach(expense => {
        if (expense.type === 'ingreso') {
          totalIngresos += expense.amount;
        } else {
          totalGastos += expense.amount;
        }
        
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      });
    } 
    // Si estamos en desarrollo sin MongoDB
    else {
      expenses.forEach(expense => {
        if (expense.type === 'ingreso') {
          totalIngresos += expense.amount;
        } else {
          totalGastos += expense.amount;
        }
        
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      });
    }
    
    return res.json({
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      expensesByCategory
    });
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al obtener estadísticas de gastos: ${err.message}\n`
    );
    
    console.error('Error al obtener estadísticas de gastos:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener un gasto por ID
const getExpenseById = async (req, res) => {
  try {
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const expense = await Expense.findById(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ msg: 'Gasto no encontrado' });
      }
      
      return res.json(expense);
    } 
    // Si estamos en desarrollo sin MongoDB
    else {
      const expense = expenses.find(exp => exp.id === req.params.id);
      
      if (!expense) {
        return res.status(404).json({ msg: 'Gasto no encontrado' });
      }
      
      return res.json(expense);
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al obtener gasto por ID: ${err.message}\n`
    );
    
    console.error('Error al obtener gasto por ID:', err.message);
    
    // Verificar si el error es por un ID inválido
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gasto no encontrado' });
    }
    
    res.status(500).send('Error del servidor');
  }
};

// Crear un nuevo gasto
const createExpense = async (req, res) => {
  const { concept, amount, date, category, type } = req.body;
  
  try {
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const newExpense = new Expense({
        concept,
        amount,
        date,
        category,
        type
      });
      
      const expense = await newExpense.save();
      return res.json(expense);
    } 
    // Si estamos en desarrollo sin MongoDB
    else {
      const newExpense = {
        id: (expenses.length + 1).toString(),
        concept,
        amount,
        date,
        category,
        type,
        createdAt: new Date()
      };
      
      expenses.push(newExpense);
      return res.json(newExpense);
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al crear gasto: ${err.message}\n`
    );
    
    console.error('Error al crear gasto:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Actualizar un gasto
const updateExpense = async (req, res) => {
  const { concept, amount, date, category, type } = req.body;
  
  try {
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      let expense = await Expense.findById(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ msg: 'Gasto no encontrado' });
      }
      
      // Construir objeto de actualización
      const expenseFields = {};
      if (concept) expenseFields.concept = concept;
      if (amount) expenseFields.amount = amount;
      if (date) expenseFields.date = date;
      if (category) expenseFields.category = category;
      if (type) expenseFields.type = type;
      
      expense = await Expense.findByIdAndUpdate(
        req.params.id,
        { $set: expenseFields },
        { new: true }
      );
      
      return res.json(expense);
    } 
    // Si estamos en desarrollo sin MongoDB
    else {
      const expenseIndex = expenses.findIndex(exp => exp.id === req.params.id);
      
      if (expenseIndex === -1) {
        return res.status(404).json({ msg: 'Gasto no encontrado' });
      }
      
      // Actualizar campos
      if (concept) expenses[expenseIndex].concept = concept;
      if (amount) expenses[expenseIndex].amount = amount;
      if (date) expenses[expenseIndex].date = date;
      if (category) expenses[expenseIndex].category = category;
      if (type) expenses[expenseIndex].type = type;
      
      return res.json(expenses[expenseIndex]);
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al actualizar gasto: ${err.message}\n`
    );
    
    console.error('Error al actualizar gasto:', err.message);
    
    // Verificar si el error es por un ID inválido
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gasto no encontrado' });
    }
    
    res.status(500).send('Error del servidor');
  }
};

// Eliminar un gasto
const deleteExpense = async (req, res) => {
  try {
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const expense = await Expense.findById(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ msg: 'Gasto no encontrado' });
      }
      
      await Expense.findByIdAndRemove(req.params.id);
      
      return res.json({ msg: 'Gasto eliminado' });
    } 
    // Si estamos en desarrollo sin MongoDB
    else {
      const expenseIndex = expenses.findIndex(exp => exp.id === req.params.id);
      
      if (expenseIndex === -1) {
        return res.status(404).json({ msg: 'Gasto no encontrado' });
      }
      
      expenses.splice(expenseIndex, 1);
      
      return res.json({ msg: 'Gasto eliminado' });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al eliminar gasto: ${err.message}\n`
    );
    
    console.error('Error al eliminar gasto:', err.message);
    
    // Verificar si el error es por un ID inválido
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gasto no encontrado' });
    }
    
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getExpenses,
  getExpenseStats,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
