import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';

const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/mercado_simple';

function normalizeName(name) {
  return name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function syncCategories() {
  try {
    await mongoose.connect(mongoUri);

    const productCategories = await Product.distinct('category');

    const categoryNames = [
      'General',
      ...productCategories.filter(
        (name) => typeof name === 'string' && name.trim()
      ),
    ];

    let created = 0;

    for (const rawName of categoryNames) {
      const name = rawName.trim();
      const normalizedName = normalizeName(name);

      const result = await Category.updateOne(
        { normalizedName },
        {
          $setOnInsert: {
            name,
            normalizedName,
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        created++;
        console.log(`Categoría creada: ${name}`);
      }
    }

    console.log(`Sincronización terminada. Nuevas categorías: ${created}`);
  } catch (error) {
    console.error('Error al sincronizar categorías:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

syncCategories();
