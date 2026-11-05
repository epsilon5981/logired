// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/envios.controller');

const router = Router();

router.get('/', controller.listar);          // listar (filtros: ?estado=en_transito, ?cliente_id=1)
router.get('/:id', controller.obtener);      // obtener un envío por id
router.post('/', controller.crear);          // crear (registrar) un envío
router.put('/:id', controller.actualizar);   // reemplazar un envío (p. ej. cambiar su estado)
router.delete('/:id', controller.eliminar);  // eliminar un envío

module.exports = router;
