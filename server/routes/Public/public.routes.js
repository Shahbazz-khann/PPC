const express = require('express');
const router = express.Router();
const publicController = require('../../controller/Public/public.controller');

router.get('/properties/search', publicController.getProperties);
router.get('/properties/filters', publicController.getFilters);

module.exports = router;
