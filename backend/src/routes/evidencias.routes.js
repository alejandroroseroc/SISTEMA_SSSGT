const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const evidenciasController = require('../controllers/evidencias.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Evidencias
 *   description: Gestión de evidencias en PDF por estándar
 */

/**
 * @swagger
 * /api/evidencias:
 *   post:
 *     summary: Sube una evidencia PDF
 *     tags: [Evidencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [archivo]
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *               nombre:
 *                 type: string
 *               estandarId:
 *                 type: integer
 *               itemId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Evidencia subida
 *       400:
 *         description: Archivo inválido o empresa no registrada
 */
router.post('/', verifyToken, upload.single('archivo'), evidenciasController.subir);

/**
 * @swagger
 * /api/evidencias:
 *   get:
 *     summary: Lista las evidencias de la empresa
 *     tags: [Evidencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estandarId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de evidencias
 */
router.get('/', verifyToken, evidenciasController.listar);

/**
 * @swagger
 * /api/evidencias/estandar/{estandarId}:
 *   get:
 *     summary: Lista evidencias filtradas por estándar
 *     tags: [Evidencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estandarId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de evidencias del estándar
 */
router.get('/estandar/:estandarId', verifyToken, evidenciasController.listarPorEstandar);

/**
 * @swagger
 * /api/evidencias/{id}/descargar:
 *   get:
 *     summary: Descarga una evidencia PDF
 *     tags: [Evidencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archivo PDF
 *       404:
 *         description: No encontrada
 */
router.get('/:id/descargar', verifyToken, evidenciasController.descargar);

/**
 * @swagger
 * /api/evidencias/{id}:
 *   delete:
 *     summary: Elimina una evidencia
 *     tags: [Evidencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eliminada
 *       403:
 *         description: Sin acceso
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', verifyToken, evidenciasController.eliminar);

module.exports = router;
