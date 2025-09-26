const rateLimit = require('express-rate-limit');

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

module.exports = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
