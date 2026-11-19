import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Product from './models/Product.js';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import productRoutes from './routes/products.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mercado_simple';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  throw new Error('Configura JWT_SECRET en server/.env con al menos 24 caracteres.');
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.use((_req, res) => res.status(404).json({ message: 'No se encontró esta ruta.' }));
app.use((error, _req, res, _next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'Ya existe un registro con esos datos.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Revisa los datos e intenta de nuevo.' });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({ message: status >= 500 ? 'Ocurrió un error en el servidor.' : error.message });
});

const demoProducts = [
  { name: 'Audífonos Bluetooth', description: 'Sonido claro para acompañarte en el día.', price: 699, category: 'Tecnología' },
  { name: 'Mochila urbana', description: 'Espacio práctico para tus cosas de todos los días.', price: 549, category: 'Accesorios' },
  { name: 'Termo de acero', description: 'Mantiene tus bebidas a la temperatura ideal.', price: 299, category: 'Cocina' },
  { name: 'Lámpara de escritorio', description: 'Luz cálida y diseño sencillo para tu espacio.', price: 420, category: 'Hogar' },
];

async function start() {
  await mongoose.connect(mongoUri);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres.');
    const existingAdmin = await User.findOne({ email: adminEmail }).select('+passwordHash');
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
    } else {
      await User.create({
        name: 'Administrador',
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: 'admin',
      });
    }
  }
  await Product.collection.updateMany({ imageUrl: { $exists: true } }, { $unset: { imageUrl: '' } });
  if (await Product.estimatedDocumentCount() === 0) await Product.insertMany(demoProducts);
  app.listen(port, '0.0.0.0', () => console.log(`API lista en http://localhost:${port}`));
}

start().catch((error) => {
  console.error('No se pudo iniciar la API. Revisa MongoDB y server/.env.', error.message);
  process.exit(1);
});
