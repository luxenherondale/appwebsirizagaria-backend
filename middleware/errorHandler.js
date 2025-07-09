const fs = require('fs');
const path = require('path');

// Middleware para manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  // Registrar el error en el archivo de logs
  const errorMessage = `${new Date().toISOString()} - ${err.name}: ${err.message}\nRuta: ${req.originalUrl}\nMétodo: ${req.method}\nIP: ${req.ip}\n${err.stack}\n\n`;
  
  fs.appendFileSync(
    path.join(__dirname, '..', 'logs', 'errorlog'),
    errorMessage
  );
  
  console.error('Error:', err.message);
  
  // Determinar el código de estado HTTP
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Responder al cliente
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = errorHandler;
