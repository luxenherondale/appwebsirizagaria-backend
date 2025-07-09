const mongoose = require('mongoose');

// Esquema para el modelo de libro
const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: false
  },
  portada: {
    type: String,
    required: false
  },
  sinopsis: {
    type: String,
    required: false
  },
  stock: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  consignadosVendidos: {
    type: Number,
    default: 0
  },
  consignadosNoVendidos: {
    type: Number,
    default: 0
  },
  promocionales: {
    type: Number,
    default: 0
  },
  regalados: {
    type: Number,
    default: 0
  },
  ubicacionActual: {
    type: String,
    default: 'Bodega principal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Modelo de libro para MongoDB
const Book = mongoose.model('Book', BookSchema);

// Datos de libros para desarrollo sin MongoDB
let books = [
  {
    id: '1',
    title: 'El camino del artista',
    author: 'Julia Cameron',
    isbn: '9781234567890',
    portada: 'https://via.placeholder.com/150',
    sinopsis: 'Una guía para descubrir y recuperar la creatividad',
    stock: 50,
    sold: 25,
    consignadosVendidos: 10,
    consignadosNoVendidos: 5,
    promocionales: 3,
    regalados: 2,
    ubicacionActual: 'Bodega principal',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '9780307474728',
    portada: 'https://via.placeholder.com/150',
    sinopsis: 'La historia de la familia Buendía a lo largo de siete generaciones en Macondo',
    stock: 30,
    sold: 20,
    consignadosVendidos: 8,
    consignadosNoVendidos: 4,
    promocionales: 2,
    regalados: 1,
    ubicacionActual: 'Bodega secundaria',
    createdAt: new Date()
  }
];

module.exports = { Book, books };
