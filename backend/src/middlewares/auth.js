// Middleware de autenticação JWT para o Gview
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

/**
 * authMiddleware — verifica o token JWT no header Authorization.
 * Anexa o usuário decodificado (id, email, role) em req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * adminOnly — middleware que verifica se o usuário autenticado é ADMIN.
 * Deve ser usado APÓS authMiddleware.
 */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
