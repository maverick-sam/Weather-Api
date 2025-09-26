const providers = require('../services/providerClients');
const cache = require('../services/cache');

async function searchLocations(req, res, next) {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q query param required' });

    const cacheKey = 'loc:' + q.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', results: cached });

    // Use WeatherAPI search (and optionally OpenWeather geocoding)
    const result = await providers.fetchWeatherAPILocations(q);
    cache.set(cacheKey, result);
    res.json({ source: 'providers', results: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { searchLocations };
