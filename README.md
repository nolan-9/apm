# Mercado Simple

Aplicación móvil con Expo y React Native, una API con Express y una base MongoDB. El catálogo permite crear, consultar, editar y eliminar productos. Cada cuenta conserva su propio carrito, donde se pueden agregar artículos, aumentar su cantidad o quitarlos.

El proyecto no incluye compra, pago ni envío.

## Requisitos

- Node.js 22.13 o posterior
- Docker Desktop (para iniciar MongoDB local)
- Expo Go para abrir la app en un teléfono o emulador

## Iniciar MongoDB y la API

Desde la raíz del proyecto, en una terminal:

```powershell
docker compose up -d mongodb
Copy-Item server/.env.example server/.env
Set-Location server
npm install
npm run dev
```

La API queda en `http://localhost:4000`; puedes comprobarla en `http://localhost:4000/api/health`. En el primer inicio agrega algunos productos de ejemplo al catálogo vacío.

## Iniciar la app

En otra terminal desde la raíz del proyecto:

```powershell
yarn install
Copy-Item .env.example .env
npx expo start
```

La URL predeterminada funciona en web y en el simulador de iOS. Para el emulador de Android, cambia `EXPO_PUBLIC_API_URL` en `.env` a `http://10.0.2.2:4000/api`. Para un teléfono físico, usa la IP local de tu computadora, por ejemplo `http://192.168.1.20:4000/api`; ambos dispositivos deben estar en la misma red. Reinicia Expo después de cambiar `.env`.

La API usa MongoDB local por defecto. Para conectar MongoDB Atlas, cambia `MONGODB_URI` en `server/.env` por la URI de tu clúster. Define también un `JWT_SECRET` propio de al menos 24 caracteres.

## Estructura

- `src/app/`: pantallas y navegación con Expo Router.
- `src/components/`: campos, botones y tarjetas reutilizables.
- `src/context/` y `src/services/`: sesión, almacenamiento seguro y llamadas a la API.
- `server/src/`: autenticación, productos, carrito y modelos MongoDB.
- `docker-compose.yml`: solo MongoDB local; no se reutiliza la configuración anterior de Strapi.

Las cuentas creadas desde el registro tienen el rol `user` y solo pueden consultar el catálogo. El usuario administrador se configura con `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `server/.env`; puede crear, editar y eliminar productos y categorías. Las categorías asignadas a productos no se pueden eliminar hasta que esos productos se reasignen. Las rutas de modificación también rechazan peticiones de usuarios sin el rol `admin`.

## API incluida

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET`, `POST /api/products`; `GET`, `PUT`, `DELETE /api/products/:id`
- `GET`, `POST /api/categories`; `DELETE /api/categories/:id`
- `GET /api/cart`; `POST`, `DELETE /api/cart/:productId`

Las rutas de productos y carrito requieren iniciar sesión. Agregar un artículo por segunda vez aumenta su cantidad; quitarlo lo elimina del carrito.
