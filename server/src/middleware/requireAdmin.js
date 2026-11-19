export default function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede modificar productos.' });
  }
  return next();
}
