const { Router } = require('express');
const empresaController = require('../controllers/empresa.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.post('/', empresaController.crear);
router.get('/mi', empresaController.obtenerMia);
router.put('/:id', empresaController.actualizar);

module.exports = router;
