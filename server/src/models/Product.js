
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isSafeInteger
  },
  category: {
    type: String,
    trim: true,
    maxlength: 60,
    default: 'General'
  },
  imageKey: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
