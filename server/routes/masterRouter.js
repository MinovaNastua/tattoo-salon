const express = require('express');
const Router = require('express').Router;
const MasterController = require('../controllers/masterController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/registration', upload.single('photo'), MasterController.registration);
router.post('/login', MasterController.login);
router.get('/auth', authenticateToken, MasterController.auth);
router.get('/', authenticateToken, MasterController.findAll);
router.get('/:id', authenticateToken, MasterController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), MasterController.update);
router.delete('/:id', authenticateToken, MasterController.delete);

module.exports = router;