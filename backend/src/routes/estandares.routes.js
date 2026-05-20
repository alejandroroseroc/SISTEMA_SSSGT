const { Router } = require('express');
const estandaresController = require('../controllers/estandares.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', estandaresController.listar);
router.get('/:id', estandaresController.obtener);

module.exports = router;
