# appwebsirizagaria-backend

# Editorial Siriza Agaria — Backend

Este proyecto es el backend (API REST) para la gestión integral de la Editorial Siriza Agaria. Permite administrar usuarios, stock de libros, ventas, contabilidad, proyectos editoriales, marketing, cotizaciones y mucho más. Construido en Node.js con Express y MongoDB.

---

## **Características principales**

- API RESTful con endpoints seguros (JWT)
- Control de acceso y roles de usuario (admin, editor, lector)
- Gestión avanzada y segmentada de stock de libros
- Integración con ventas online y consignaciones
- Módulo de contabilidad: gastos, ingresos y reportes mensuales
- Gestión de proyectos editoriales y sus etapas
- Generación de cotizaciones, órdenes y PDFs
- Registro y seguimiento de marketing (bookfluencers)
- CRUD de libros, usuarios y transacciones

---

## **Tecnologías utilizadas**

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [JWT (jsonwebtoken)](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [cors](https://www.npmjs.com/package/cors)

---

## **Estructura del proyecto**

```plaintext
editorial-backend/
│
├── controllers/     # Lógica de cada módulo/endpoint
│     └── authController.js
│
├── middleware/      # Middlewares de autenticación y control de roles
│
├── models/          # Modelos de datos (Mongoose)
│     └── User.js
│
├── routes/          # Rutas de la API (divididas por módulo)
│     └── auth.js
│
├── .env             # Variables de entorno (NO subir a repositorios públicos)
├── server.js        # Archivo principal para levantar el servidor
├── package.json
└── README.md
```
