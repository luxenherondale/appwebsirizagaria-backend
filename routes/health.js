const express = require('express');
const router = express.Router();

// @ruta    GET api/health
// @desc    Verificar que el servidor está funcionando
// @acceso  Público
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API de Siriza Agaria funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
