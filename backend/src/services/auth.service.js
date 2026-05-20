const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sgsst_dev_secret_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.register = async ({ nombre, email, password }) => {
  // Check if email already exists
  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    throw new Error('EMAIL_EXISTS');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.usuario.create({
    data: { nombre, email, password: hashedPassword },
  });

  const token = signToken(user.id);

  return {
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email },
  };
};

exports.login = async ({ email, password }) => {
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = signToken(user.id);

  return {
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email },
  };
};

exports.getProfile = async (userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, nombre: true, email: true, createdAt: true },
  });
  return user;
};

exports.updatePerfil = async ({ userId, nombre, email, password }) => {
  const data = {};
  if (nombre) data.nombre = nombre;
  if (email) {
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing && existing.id !== userId) throw new Error('EMAIL_EXISTS');
    data.email = email;
  }
  if (password) {
    if (password.length < 8) throw new Error('PASSWORD_TOO_SHORT');
    data.password = await bcrypt.hash(password, 10);
  }
  const user = await prisma.usuario.update({ where: { id: userId }, data });
  return { id: user.id, nombre: user.nombre, email: user.email };
};

// Export for testing
exports._prisma = prisma;
exports._JWT_SECRET = JWT_SECRET;
