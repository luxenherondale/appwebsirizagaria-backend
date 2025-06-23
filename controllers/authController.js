const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    // Validar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash(contraseña, salt);

    const user = new User({
      nombre,
      email,
      contraseña: contraseñaHash,
      rol,
    });

    await user.save();

    res.status(201).json({ message: "Usuario registrado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro.", error });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Usuario no encontrado." });

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta." });

    // Generar JWT
    const payload = {
      userId: user._id,
      rol: user.rol,
      nombre: user.nombre,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { nombre: user.nombre, email: user.email, rol: user.rol },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login.", error });
  }
};
