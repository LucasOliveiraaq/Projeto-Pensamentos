const express = require('express');
const router = express.Router();
const ToughtsController = require('../controllers/ToughtController');

router.get('/', ToughtsController.showToughts)

module.exports = router;