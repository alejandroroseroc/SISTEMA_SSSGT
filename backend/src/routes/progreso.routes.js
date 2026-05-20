const { Router } = require('express');
const progresoController = require('../controllers/progreso.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/:estandarId', progresoController.obtener);
router.put('/:estandarId', progresoController.guardar);

module.exports = router;
