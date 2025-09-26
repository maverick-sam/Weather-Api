const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const rateLimiter = require('./middlewares/rateLimiter');

const weatherRoutes = require('./routes/weather');
const locationRoutes = require('./routes/locations');
const healthRoutes = require('./routes/health');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter);

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Weather API Service',
    version: '1.0.0',
    description: 'Aggregates weather data from multiple providers'
  },
  servers: [{ url: 'http://localhost:' + (process.env.PORT || 3000) }]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js']
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/weather', weatherRoutes);
app.use('/locations', locationRoutes);
app.use('/health', healthRoutes);

// Error handler (last)
app.use(errorHandler);

module.exports = app;
