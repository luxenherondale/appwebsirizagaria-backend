const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { User, users } = require('../models/user');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    // En un entorno con MongoDB:
    // const users = await User.find().select('-password');
    
    // Para desarrollo sin MongoDB:
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (err) {
    console.error('Error al obtener usuarios:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // En un entorno con MongoDB:
    // const user = await User.findById(userId).select('-password');
    
    // Para desarrollo sin MongoDB:
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error al obtener usuario por ID:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    // En un entorno con MongoDB:
    // let user = await User.findOne({ email });
    
    // Para desarrollo sin MongoDB:
    let user = users.find(u => u.email === email);
    
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    
    // Crear un nuevo usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'lector',
      date: new Date()
    };
    
    // En un entorno con MongoDB:
    // user = new User({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   role: role || 'lector'
    // });
    // await user.save();
    
    // Para desarrollo sin MongoDB:
    users.push(newUser);
    
    // Crear y devolver el token JWT
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sirizagaria_secret_dev',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error al crear usuario:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;
  
  try {
    // En un entorno con MongoDB:
    // let user = await User.findById(userId);
    
    // Para desarrollo sin MongoDB:
    let userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario que actualiza es admin o el mismo usuario
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ msg: 'No autorizado para actualizar este usuario' });
    }
    
    // Actualizar los campos
    const updatedUser = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      // Solo un admin puede cambiar el rol
      role: req.user.role === 'admin' ? (role || users[userIndex].role) : users[userIndex].role
    };
    
    // En un entorno con MongoDB:
    // const updatedFields = {};
    // if (name) updatedFields.name = name;
    // if (email) updatedFields.email = email;
    // if (role && req.user.role === 'admin') updatedFields.role = role;
    // user = await User.findByIdAndUpdate(userId, { $set: updatedFields }, { new: true }).select('-password');
    
    // Para desarrollo sin MongoDB:
    users[userIndex] = updatedUser;
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error al actualizar usuario:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Solo un admin puede eliminar usuarios
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'No autorizado para eliminar usuarios' });
    }
    
    // En un entorno con MongoDB:
    // const user = await User.findById(userId);
    
    // Para desarrollo sin MongoDB:
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // En un entorno con MongoDB:
    // await User.findByIdAndRemove(userId);
    
    // Para desarrollo sin MongoDB:
    users.splice(userIndex, 1);
    
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
