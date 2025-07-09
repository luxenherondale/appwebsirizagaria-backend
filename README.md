# Backend API para Siriza Agaria

API REST para la gestión de la editorial independiente Siriza Agaria.

## Estructura del proyecto

```
backend/
├── controllers/     # Controladores para la lógica de negocio
├── logs/           # Registros de errores y solicitudes
├── middleware/     # Middleware para autenticación, errores, validaciones
├── models/         # Modelos de datos
├── routes/         # Rutas de la API
├── utils/          # Utilidades
├── .env            # Variables de entorno
├── package.json    # Dependencias
├── server.js       # Punto de entrada principal
```

## Requisitos previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clonar el repositorio o copiar la carpeta `backend` a tu proyecto

2. Instalar las dependencias:

```bash
cd backend
npm install
```

3. Configurar las variables de entorno:
   - Renombrar `.env.example` a `.env` si es necesario
   - Ajustar las variables según tu entorno

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

## Endpoints de la API

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `GET /api/auth/me` - Obtener usuario autenticado

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario (admin)
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Libros

- `GET /api/books` - Obtener todos los libros
- `GET /api/books/stats` - Obtener estadísticas de libros
- `GET /api/books/:id` - Obtener libro por ID
- `POST /api/books` - Crear nuevo libro
- `PUT /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

### Estado del servidor

- `GET /api/health` - Verificar estado del servidor

## Modo de desarrollo

En modo desarrollo, la API utiliza datos en memoria en lugar de una base de datos MongoDB. Esto facilita el desarrollo y las pruebas sin necesidad de configurar una base de datos.

Para utilizar MongoDB:

1. Descomentar la sección de conexión a MongoDB en `server.js`
2. Configurar la variable `MONGODB_URI` en el archivo `.env`

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a rutas protegidas, incluir el token en el header:

```
x-auth-token: <tu-token-jwt>
```
