const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/signin.js');
const usersRoutes = require('./routes/users.js');
const booksRoutes = require('./routes/books.js'); // Usando books.js para los libros según la estructura del frontend
const expensesRoutes = require('./routes/expenses.js'); // Nueva ruta de gastos
const healthRoutes = require('./routes/health.js');
const paymentRoutes = require('./routes/payment.js'); // Transbank Webpay Plus

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'request.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// Middleware para manejo de errores
const errorHandler = require('./middleware/errorHandler.js');

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/expenses', expensesRoutes); // Registrar las rutas de gastos
app.use('/api/health', healthRoutes);
app.use('/api/payment', paymentRoutes); // Transbank Webpay Plus

// Middleware de manejo de errores (debe ir después de las rutas)
app.use(errorHandler);

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('API de Siriza Agaria funcionando correctamente');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  // Registrar error en el archivo de logs
  fs.appendFileSync(
    path.join(__dirname, 'logs', 'errorlog'),
    `${new Date().toISOString()} - Error de conexión a MongoDB: ${err.message}\n`
  );
});

// En modo desarrollo, también usaremos datos en memoria como respaldo
console.log('Ejecutando en modo desarrollo con datos en memoria como respaldo');

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  
  // Crear directorio de logs si no existe
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
    console.log('Directorio de logs creado');
  }
});
