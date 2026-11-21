
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import ProductEditor from '../../components/ProductEditor';
import useRequireAuth from '../../hooks/useRequireAuth';
import { apiRequest } from '../../services/api';
import { uploadProductImage } from '../../services/productImages';

export default function NewProductScreen() {
  const { token, user, loading } = useRequireAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.replace('/products');
    }
  }, [loading, user]);

  async function saveProduct(values, selectedImage) {
    setSaving(true);

    let createdProduct = null;

    try {
      // 1. Guardar los datos del producto en MongoDB.
      const data = await apiRequest('/products', {
        method: 'POST',
        body: values,
        token,
      });

      createdProduct = data.product;

      if (!createdProduct?._id) {
        throw new Error(
          'El servidor no devolvió el ID del producto creado.'
        );
      }

      // 2. Subir la imagen a Amazon S3, si fue seleccionada.
      if (selectedImage) {
        try {
          await uploadProductImage(
            createdProduct._id,
            selectedImage,
            token
          );
        } catch (imageError) {
          throw new Error(
            `El producto se creó correctamente, pero no se pudo subir su imagen: ${imageError.message}. ` +
            'Puedes agregarla después desde Editar producto.'
          );
        }
      }

      // 3. Volver al catálogo cuando todo termine.
      router.replace('/products');
    } finally {
      setSaving(false);
    }
  }

  if (loading || user?.role !== 'admin') {
    return null;
  }

  return (
    <ProductEditor
      title="Agregar producto"
      onSave={saveProduct}
      saving={saving}
    />
  );
}
