const { Router } = require('express');
const reportesController = require('../controllers/reportes.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

/**
 * @openapi
 * /reportes/cumplimiento:
 *   get:
 *     summary: Obtiene el cumplimiento por estándar de la empresa del usuario
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estándares con porcentaje de cumplimiento
 *       400:
 *         description: Empresa no registrada
 *       401:
 *         description: Token no válido
 */
router.get('/cumplimiento', reportesController.cumplimiento);

/**
 * @openapi
 * /reportes/historial:
 *   get:
 *     summary: Historial paginado de acciones del usuario
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Historial paginado con metadatos de paginación
 */
router.get('/historial', reportesController.historial);

router.get('/notificaciones', reportesController.notificaciones);

/**
 * @openapi
 * /reportes/ejecutivo:
 *   get:
 *     summary: Reporte ejecutivo completo con resumen, estándares y pendientes críticos
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte ejecutivo con empresa, resumen, porEstandar y pendientesCriticos
 *       400:
 *         description: Empresa no registrada
 *       401:
 *         description: Token no válido
 */
router.get('/ejecutivo', reportesController.ejecutivo);

router.post('/pdf', reportesController.pdf);
router.post('/arl', reportesController.arl);

module.exports = router;
