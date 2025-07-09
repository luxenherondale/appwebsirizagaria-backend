const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Middleware para verificar el token JWT
const auth = (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('x-auth-token');

    // Verificar si no hay token
    if (!token) {
      return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    // Verificar el token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sirizagaria_secret_dev');
      req.user = decoded.user;
      next();
    } catch (err) {
      // Registrar error en el log
      fs.appendFileSync(
        path.join(__dirname, '..', 'logs', 'errorlog'),
        `${new Date().toISOString()} - Error de autenticación: Token inválido\n`
      );
      
      return res.status(401).json({ msg: 'Token no válido' });
    }
  } catch (err) {
    // Registrar error en el log
    fs.appendFileSync(
      path.join(__dirname, '..', 'logs', 'errorlog'),
      `${new Date().toISOString()} - Error en middleware auth: ${err.message}\n`
    );
    
    console.error('Error en middleware auth:', err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = auth;
