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
const smtpConfigRoutes = require('./routes/smtpConfig.js'); // SMTP Configuration

// Importar email sender
const emailSender = require('./utils/emailSender');
const SmtpConfig = require('./models/smtpConfig');

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
app.use('/api/smtp', smtpConfigRoutes); // SMTP Configuration

// Middleware de manejo de errores (debe ir después de las rutas)
app.use(errorHandler);

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('API de Siriza Agaria funcionando correctamente');
});

// Conexión a MongoDB con reintentos
const connectMongoDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
      });
      console.log('Conectado a MongoDB');
      return;
    } catch (err) {
      retries++;
      console.error(`Error al conectar a MongoDB (intento ${retries}/${maxRetries}):`, err.message);
      if (retries < maxRetries) {
        console.log(`Reintentando en 5 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('No se pudo conectar a MongoDB después de varios intentos');
        fs.appendFileSync(
          path.join(__dirname, 'logs', 'errorlog'),
          `${new Date().toISOString()} - Error de conexión a MongoDB después de ${maxRetries} intentos: ${err.message}\n`
        );
      }
    }
  }
};

connectMongoDB();

// Initialize SMTP configuration on startup
const initializeSmtpConfig = async () => {
  try {
    let config = await SmtpConfig.findOne();
    
    if (!config) {
      config = new SmtpConfig({
        host: '',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        },
        from: '',
        fromName: 'Siriza Agaria',
        isActive: true
      });
      await config.save();
      console.log('✅ Default SMTP configuration created');
    }

    process.env.SMTP_HOST = config.host;
    process.env.SMTP_PORT = config.port;
    process.env.SMTP_SECURE = config.secure ? 'true' : 'false';
    process.env.SMTP_USER = config.auth.user;
    process.env.SMTP_PASSWORD = config.auth.pass;
    process.env.EMAIL_FROM = config.from;

    const emailInitialized = emailSender.initialize();
    if (emailInitialized) {
      console.log('✅ Email service initialized with SMTP configuration');
    } else {
      console.warn('⚠️  Email service not initialized - check SMTP configuration');
    }
  } catch (error) {
    console.error('❌ Error initializing SMTP configuration:', error.message);
  }
};

setTimeout(initializeSmtpConfig, 2000);

// Log del modo de ejecución
console.log(`Ejecutando en modo ${process.env.NODE_ENV || 'development'}`);

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
