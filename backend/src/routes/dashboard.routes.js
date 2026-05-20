const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyToken);

router.get('/', dashboardController.obtener);

module.exports = router;
