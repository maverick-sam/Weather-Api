const providers = require('../services/providerClients');
const cache = require('../services/cache');
const aggregator = require('../utils/aggregator');

const CACHE_PREFIX_CURRENT = 'current:';
const CACHE_PREFIX_FORECAST = 'forecast:';

async function getCurrentWeather(req, res, next) {
  try {
    const location = req.query.location;
    if (!location) return res.status(400).json({ error: 'location query param required' });

    const cacheKey = CACHE_PREFIX_CURRENT + location.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', ...cached });

    // call providers concurrently
    const [owResp, waResp] = await Promise.allSettled([
      providers.fetchOpenWeatherCurrent(location),
      providers.fetchWeatherAPICurrent(location)
    ]);

    const results = [];
    if (owResp.status === 'fulfilled' && owResp.value) results.push(owResp.value);
    if (waResp.status === 'fulfilled' && waResp.value) results.push(waResp.value);

    if (results.length === 0) {
      const errors = [owResp.reason?.message, waResp.reason?.message].filter(Boolean);
      return res.status(502).json({ error: 'failed to fetch from providers', details: errors });
    }

    const aggregated = aggregator.aggregateCurrent(results);
    const payload = { location: aggregated.location, current: aggregated.current, providers: results, aggregated: aggregated.current, updated_at: new Date().toISOString() };
    cache.set(cacheKey, payload);
    res.json({ source: 'providers', ...payload });
  } catch (err) {
    next(err);
  }
}

async function getForecast(req, res, next) {
  try {
    const location = req.query.location;
    const days = parseInt(req.query.days || '3', 10);
    if (!location) return res.status(400).json({ error: 'location query param required' });
    if (days < 1 || days > 7) return res.status(400).json({ error: 'days must be between 1 and 7' });

    const cacheKey = CACHE_PREFIX_FORECAST + `${location.toLowerCase()}:days=${days}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: 'cache', ...cached });

    const [owResp, waResp] = await Promise.allSettled([
      providers.fetchOpenWeatherForecast(location, days),
      providers.fetchWeatherAPIForecast(location, days)
    ]);

    const results = [];
    if (owResp.status === 'fulfilled' && owResp.value) results.push(owResp.value);
    if (waResp.status === 'fulfilled' && waResp.value) results.push(waResp.value);

    if (results.length === 0) {
      const errors = [owResp.reason?.message, waResp.reason?.message].filter(Boolean);
      return res.status(502).json({ error: 'failed to fetch forecasts', details: errors });
    }

    const aggregated = aggregator.aggregateForecast(results, days);

    const payload = { location: aggregated.location, forecast: aggregated.forecast, providers: results, aggregated: aggregated.forecast, updated_at: new Date().toISOString() };
    cache.set(cacheKey, payload);
    res.json({ source: 'providers', ...payload });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCurrentWeather,
  getForecast
};
