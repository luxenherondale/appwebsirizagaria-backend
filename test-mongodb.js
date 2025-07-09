const mongoose = require('mongoose');
require('dotenv').config();

console.log('Iniciando prueba de conexión a MongoDB...');
console.log(`URI de MongoDB: ${process.env.MONGODB_URI || 'No configurada'}`);

// Intentar conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conexión exitosa a MongoDB');
  console.log('Información de la conexión:');
  console.log(`- Host: ${mongoose.connection.host}`);
  console.log(`- Puerto: ${mongoose.connection.port}`);
  console.log(`- Base de datos: ${mongoose.connection.name}`);
  console.log(`- Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'No conectado'}`);
  
  // Cerrar la conexión después de la prueba
  mongoose.connection.close().then(() => {
    console.log('Conexión cerrada correctamente');
    process.exit(0);
  });
})
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
  console.error('Detalles del error:', err);
  process.exit(1);
});
