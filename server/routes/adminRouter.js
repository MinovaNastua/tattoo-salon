const Router = require('express').Router;
const AdminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/registration', upload.single('photo'), AdminController.registration);
router.post('/login', AdminController.login);
router.get('/auth', authenticateToken, AdminController.auth);
router.get('/', authenticateToken, AdminController.findAll);
router.get('/:id', authenticateToken, AdminController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), AdminController.update);
router.delete('/:id', authenticateToken, AdminController.delete);

module.exports = router;