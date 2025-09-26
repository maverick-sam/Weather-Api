const express = require('express');
const router = express.Router();
const controller = require('../controllers/weatherController');

/**
 * @swagger
 * /weather/current:
 *   get:
 *     summary: Current weather (aggregated)
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: city name or "city,country"
 *     responses:
 *       200:
 *         description: Aggregated current weather
 */
router.get('/current', controller.getCurrentWeather);

/**
 * @swagger
 * /weather/forecast:
 *   get:
 *     summary: Forecast (aggregated)
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *         description: number of days (default 3)
 *     responses:
 *       200:
 *         description: Aggregated forecast
 */
router.get('/forecast', controller.getForecast);

module.exports = router;
