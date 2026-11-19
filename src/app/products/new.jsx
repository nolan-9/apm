import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import ProductEditor from '../../components/ProductEditor';
import useRequireAuth from '../../hooks/useRequireAuth';
import { apiRequest } from '../../services/api';

export default function NewProductScreen() {
  const { token, user, loading } = useRequireAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') router.replace('/products');
  }, [loading, user]);

  async function saveProduct(values) {
    setSaving(true);
    try {
      await apiRequest('/products', { method: 'POST', body: values, token });
      router.replace('/products');
    } finally {
      setSaving(false);
    }
  }

  if (loading || user?.role !== 'admin') {
    return null;
  }

  return <ProductEditor title="Agregar producto" onSave={saveProduct} saving={saving} />;
}
