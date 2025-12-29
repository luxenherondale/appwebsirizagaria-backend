const { Book, books } = require('../models/book');
const fs = require('fs');
const path = require('path');

// Obtener todos los libros
const getBooks = async (req, res) => {
  try {
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const books = await Book.find();
      return res.json({ books });
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      return res.json({ books });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al obtener libros: ${err.message}\n`
    );
    
    console.error('Error al obtener libros:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener estadísticas de libros
const getBookStats = async (req, res) => {
  try {
    let totalBooks = 0;
    let totalSold = 0;
    let booksByAuthor = {};
    
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const allBooks = await Book.find();
      
      totalBooks = allBooks.reduce((sum, book) => sum + book.stock, 0);
      totalSold = allBooks.reduce((sum, book) => sum + book.sold, 0);
      
      // Agrupar por autor
      allBooks.forEach(book => {
        if (!booksByAuthor[book.author]) {
          booksByAuthor[book.author] = { count: 0, sold: 0 };
        }
        booksByAuthor[book.author].count += 1;
        booksByAuthor[book.author].sold += book.sold;
      });
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      totalBooks = books.reduce((sum, book) => sum + book.stock, 0);
      totalSold = books.reduce((sum, book) => sum + book.sold, 0);
      
      // Agrupar por autor
      books.forEach(book => {
        if (!booksByAuthor[book.author]) {
          booksByAuthor[book.author] = { count: 0, sold: 0 };
        }
        booksByAuthor[book.author].count += 1;
        booksByAuthor[book.author].sold += book.sold;
      });
    }
    
    // Calcular porcentajes
    const totalPrinted = totalBooks + totalSold;
    const soldPercentage = totalPrinted > 0 ? (totalSold / totalPrinted) * 100 : 0;
    
    return res.json({
      stats: {
        totalBooks,
        totalSold,
        totalPrinted,
        soldPercentage,
        booksByAuthor
      }
    });
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al obtener estadísticas de libros: ${err.message}\n`
    );
    
    console.error('Error al obtener estadísticas de libros:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener un libro por ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const book = await Book.findById(id);
      
      if (!book) {
        return res.status(404).json({ msg: 'Libro no encontrado' });
      }
      
      return res.json({ book });
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      const book = books.find(b => b.id === id);
      
      if (!book) {
        return res.status(404).json({ msg: 'Libro no encontrado' });
      }
      
      return res.json({ book });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al obtener libro por ID: ${err.message}\n`
    );
    
    console.error('Error al obtener libro por ID:', err.message);
    
    // Si es un error de formato de ID de MongoDB
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Libro no encontrado' });
    }
    
    res.status(500).send('Error del servidor');
  }
};

// Crear un nuevo libro
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, portada, sinopsis, stock, sold, consignadosVendidos, consignadosNoVendidos, promocionales, regalados, ubicacionActual } = req.body;
    
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const newBook = new Book({
        title,
        author,
        isbn,
        portada,
        sinopsis,
        stock: stock || 0,
        sold: sold || 0,
        consignadosVendidos: consignadosVendidos || 0,
        consignadosNoVendidos: consignadosNoVendidos || 0,
        promocionales: promocionales || 0,
        regalados: regalados || 0,
        ubicacionActual: ubicacionActual || 'Bodega principal'
      });
      
      const book = await newBook.save();
      return res.json({ book });
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      const newBook = {
        id: Date.now().toString(),
        title,
        author,
        isbn,
        portada,
        sinopsis,
        stock: stock || 0,
        sold: sold || 0,
        consignadosVendidos: consignadosVendidos || 0,
        consignadosNoVendidos: consignadosNoVendidos || 0,
        promocionales: promocionales || 0,
        regalados: regalados || 0,
        ubicacionActual: ubicacionActual || 'Bodega principal',
        createdAt: new Date()
      };
      
      books.push(newBook);
      return res.json({ book: newBook });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al crear libro: ${err.message}\n`
    );
    
    console.error('Error al crear libro:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Actualizar un libro
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, portada, sinopsis, stock, sold, consignadosVendidos, consignadosNoVendidos, promocionales, regalados, ubicacionActual } = req.body;
    
    // Construir objeto de actualización
    const bookFields = {};
    if (title !== undefined) bookFields.title = title;
    if (author !== undefined) bookFields.author = author;
    if (isbn !== undefined) bookFields.isbn = isbn;
    if (portada !== undefined) bookFields.portada = portada;
    if (sinopsis !== undefined) bookFields.sinopsis = sinopsis;
    if (stock !== undefined) bookFields.stock = stock;
    if (sold !== undefined) bookFields.sold = sold;
    if (consignadosVendidos !== undefined) bookFields.consignadosVendidos = consignadosVendidos;
    if (consignadosNoVendidos !== undefined) bookFields.consignadosNoVendidos = consignadosNoVendidos;
    if (promocionales !== undefined) bookFields.promocionales = promocionales;
    if (regalados !== undefined) bookFields.regalados = regalados;
    if (ubicacionActual !== undefined) bookFields.ubicacionActual = ubicacionActual;
    
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      let book = await Book.findById(id);
      
      if (!book) {
        return res.status(404).json({ msg: 'Libro no encontrado' });
      }
      
      book = await Book.findByIdAndUpdate(
        id,
        { $set: bookFields },
        { new: true }
      );
      
      return res.json({ book });
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      const index = books.findIndex(b => b.id === id);
      
      if (index === -1) {
        return res.status(404).json({ msg: 'Libro no encontrado' });
      }
      
      books[index] = { ...books[index], ...bookFields };
      return res.json({ book: books[index] });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al actualizar libro: ${err.message}\n`
    );
    
    console.error('Error al actualizar libro:', err.message);
    
    // Si es un error de formato de ID de MongoDB
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Libro no encontrado' });
    }
    
    res.status(500).send('Error del servidor');
  }
};

// Eliminar un libro
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Si estamos usando MongoDB
    if (process.env.MONGODB_URI) {
      const book = await Book.findById(id);
      
      if (!book) {
        return res.status(404).json({ msg: 'Libro no encontrado' });
      }
      
      await Book.findByIdAndRemove(id);
      return res.json({ msg: 'Libro eliminado' });
    }
    // Si estamos en desarrollo sin MongoDB
    else {
      const index = books.findIndex(b => b.id === id);
      
      if (index === -1) {
        return res.status(404).json({ msg: 'Libro no encontrado' });
      }
      
      books.splice(index, 1);
      return res.json({ msg: 'Libro eliminado' });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error al eliminar libro: ${err.message}\n`
    );
    
    console.error('Error al eliminar libro:', err.message);
    
    // Si es un error de formato de ID de MongoDB
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Libro no encontrado' });
    }
    
    res.status(500).send('Error del servidor');
  }
};

// Upload book cover image
const uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    // Return the URL path to the uploaded file
    const imageUrl = `/uploads/covers/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Error uploading cover:', err.message);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

// Lookup book info by ISBN using Open Library API
const lookupISBN = async (req, res) => {
  try {
    const { isbn } = req.params;
    
    if (!isbn) {
      return res.status(400).json({ error: 'ISBN requerido' });
    }

    // Clean ISBN (remove dashes and spaces)
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    // Try Open Library API
    const axios = require('axios');
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
    
    const bookKey = `ISBN:${cleanISBN}`;
    const bookData = response.data[bookKey];

    if (!bookData) {
      return res.status(404).json({ 
        success: false,
        error: 'No se encontró información para este ISBN' 
      });
    }

    // Extract relevant info
    const result = {
      success: true,
      data: {
        title: bookData.title || '',
        author: bookData.authors ? bookData.authors.map(a => a.name).join(', ') : '',
        publisher: bookData.publishers ? bookData.publishers.map(p => p.name).join(', ') : '',
        publishDate: bookData.publish_date || '',
        pages: bookData.number_of_pages || '',
        cover: bookData.cover ? bookData.cover.large || bookData.cover.medium || bookData.cover.small : '',
        subjects: bookData.subjects ? bookData.subjects.map(s => s.name).slice(0, 5) : [],
        isbn: cleanISBN
      }
    };

    res.json(result);

  } catch (err) {
    console.error('Error looking up ISBN:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Error al buscar información del ISBN' 
    });
  }
};

module.exports = {
  getBooks,
  getBookStats,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  uploadCover,
  lookupISBN
};
