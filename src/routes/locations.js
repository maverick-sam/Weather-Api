const express = require('express');
const router = express.Router();
const controller = require('../controllers/locationsController');

/**
 * @swagger
 * /locations/search:
 *   get:
 *     summary: Search locations
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location search results
 */
router.get('/search', controller.searchLocations);

module.exports = router;
