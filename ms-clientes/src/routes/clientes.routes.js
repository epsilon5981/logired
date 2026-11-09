// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y aplica la tabla de permisos de LogiRed para la entidad Cliente.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                       // todas las rutas exigen token (401)

// Consultar: cualquier rol autenticado (administrador, despacho, flota).
// flota también consulta porque ms-envios le pide los clientes con su token.
router.get('/', controller.listar);               // ?ciudad=Cali · ?ids=1,3,8
router.get('/:id', controller.obtener);

// Crear, modificar y eliminar: solo administrador y despacho (otro rol: 403)
router.post('/', requiereRol('administrador', 'despacho'), controller.crear);
router.put('/:id', requiereRol('administrador', 'despacho'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'despacho'), controller.eliminar);

module.exports = router;
