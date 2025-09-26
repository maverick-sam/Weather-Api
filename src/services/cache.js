const NodeCache = require('node-cache');

const TTL = parseInt(process.env.CACHE_TTL || '600', 10);
const cache = new NodeCache({ stdTTL: TTL, checkperiod: Math.max(60, Math.floor(TTL / 2)) });

module.exports = cache;
