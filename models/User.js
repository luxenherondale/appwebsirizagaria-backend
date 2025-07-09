const mongoose = require('mongoose');

// Esquema para el modelo de usuario
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'lector'],
    default: 'lector'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Para entorno de desarrollo sin MongoDB, también exportamos un array de usuarios
const users = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@sirizagaria.com",
    password: "$2a$10$XJrSPLXvXE4K7T8LYpxB8.2lZBi1K52X.hJyonjbQnPXnEsiqvRIK", // admin123 hasheado
    role: "admin",
    date: new Date()
  },
  {
    id: "2",
    name: "Editor",
    email: "editor@sirizagaria.com",
    password: "$2a$10$XNK7xMhUhA.LoOlXWxIqpOi8O6r0vUsVpNjKGQ.s508Q.7.lEPBSe", // editor123 hasheado
    role: "editor",
    date: new Date()
  },
  {
    id: "3",
    name: "Lector",
    email: "lector@sirizagaria.com",
    password: "$2a$10$hACwQ5oXKXQpCmbIQqTDvOUVUzT5xz6FyQoVVzXXexBLGJ9Yw5WMi", // lector123 hasheado
    role: "lector",
    date: new Date()
  }
];

module.exports = {
  User: mongoose.model('User', UserSchema),
  users
};
