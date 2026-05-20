const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios (nombre, email, password)' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const result = await authService.register({ nombre, email, password });
    return res.status(201).json(result);
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'Ya existe una cuenta con este correo' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    next(err);
  }
};

exports.updatePerfil = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    const user = await authService.updatePerfil({ userId: req.userId, nombre, email, password });
    return res.json({ user });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'Ya existe una cuenta con este correo' });
    if (err.message === 'PASSWORD_TOO_SHORT') return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json({ user });
  } catch (err) {
    next(err);
  }
};
