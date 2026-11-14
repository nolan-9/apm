import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Inicia sesión para continuar.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('name email');
    if (!user) return res.status(401).json({ message: 'La sesión ya no es válida. Inicia sesión de nuevo.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'La sesión ya no es válida. Inicia sesión de nuevo.' });
  }
}
