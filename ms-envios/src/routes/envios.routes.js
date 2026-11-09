// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y aplica la tabla de permisos de LogiRed para la entidad Envío.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/envios.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                       // todas las rutas exigen token (401)

// Consultar: cualquier rol autenticado (administrador, despacho, flota)
router.get('/', controller.listar);               // ?estado=en_transito · ?cliente_id=1
router.get('/:id', controller.obtener);

// Crear, modificar y eliminar: solo administrador y despacho (otro rol: 403)
router.post('/', requiereRol('administrador', 'despacho'), controller.crear);
router.put('/:id', requiereRol('administrador', 'despacho'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'despacho'), controller.eliminar);

module.exports = router;
