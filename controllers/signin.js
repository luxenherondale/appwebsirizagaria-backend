const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, users } = require('../models/user');

// Autenticar usuario y obtener token
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Intentar encontrar el usuario en MongoDB
    let user = await User.findOne({ email });
    
    // Si no se encuentra en MongoDB, buscar en datos locales como respaldo
    if (!user) {
      const localUser = users.find(u => u.email === email);
      if (localUser) {
        console.log('Usuario encontrado en datos locales');
        user = localUser;
      } else {
        return res.status(400).json({ msg: 'Credenciales incorrectas' });
      }
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    // Crear y devolver el token JWT
    const payload = {
      user: {
        id: user.id || user._id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sirizagaria_secret_dev',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        // Devolver token y datos del usuario (sin contraseña)
        const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
        res.json({ 
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Registrar un nuevo usuario
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe en MongoDB
    let user = await User.findOne({ email });
    
    // Si no se encuentra en MongoDB, verificar en datos locales
    if (!user) {
      const localUser = users.find(u => u.email === email);
      if (localUser) {
        return res.status(400).json({ msg: 'El usuario ya existe en datos locales' });
      }
    } else {
      return res.status(400).json({ msg: 'El usuario ya existe en MongoDB' });
    }

    // Crear un nuevo usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario en MongoDB
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'lector'
    });
    
    await user.save();
    console.log('Usuario guardado en MongoDB');
    
    // Crear y devolver el token JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sirizagaria_secret_dev',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        // Devolver token y datos del usuario (sin contraseña)
        const userObj = user.toObject();
        const { password, ...userWithoutPassword } = userObj;
        res.json({ 
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener usuario autenticado
const getMe = async (req, res) => {
  try {
    // Intentar encontrar el usuario en MongoDB
    const user = await User.findById(req.user.id).select('-password');
    
    // Si no se encuentra en MongoDB, buscar en datos locales
    if (!user) {
      const localUser = users.find(u => u.id === req.user.id);
      if (localUser) {
        const { password, ...userWithoutPassword } = localUser;
        return res.json(userWithoutPassword);
      } else {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error al obtener usuario autenticado:', err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  login,
  register,
  getMe
};
