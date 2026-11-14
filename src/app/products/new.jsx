import { useState } from 'react';
import { router } from 'expo-router';
import ProductEditor from '../../components/ProductEditor';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

export default function NewProductScreen() {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);

  async function saveProduct(values) {
    setSaving(true);
    try {
      await apiRequest('/products', { method: 'POST', body: values, token });
      router.replace('/products');
    } finally {
      setSaving(false);
    }
  }

  return <ProductEditor title="Agregar producto" onSave={saveProduct} saving={saving} />;
}
