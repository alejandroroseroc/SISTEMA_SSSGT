const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.me);
router.put('/perfil', verifyToken, authController.updatePerfil);

module.exports = router;
