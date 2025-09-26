Weather API Service 🌤️

Introduction
------------
This project is a Weather API Service that aggregates weather data from multiple providers.
Users can get current weather, forecasts, search for locations, and check the health of the API.
It is built using Node.js, with caching and rate limiting to optimize requests.
No frontend is included — it is purely a backend API service.

Getting Started
---------------

1. Clone the repository
   git clone https://github.com/your-username/weather-api-service.git
   cd weather-api-service

2. Install dependencies
   npm install

3. Get your own API keys
   You need API keys from OpenWeather and WeatherAPI:

   - OpenWeather
     Go to https://openweathermap.org/api
     Sign up for a free account
     Go to "API keys" → copy your key

   - WeatherAPI
     Go to https://www.weatherapi.com/
     Sign up for a free account
     Go to "API" → copy your key

4. Create your .env file
   Copy the placeholder:
      cp .env.example .env   # Linux / Mac
   Paste your API keys in .env:
      PORT=3000
      OPENWEATHER_API_KEY=your_real_openweathermap_api_key
      WEATHERAPI_KEY=your_real_weatherapi_key
      CACHE_TTL=600
      RATE_LIMIT_WINDOW_MINUTES=15
      RATE_LIMIT_MAX=100

   Important: Keep .env private. Do not push it to GitHub.

5. Start the server
   npm run dev
   The server will run at http://localhost:3000

API Endpoints
-------------
Endpoint                     Method   Description                                Example URL
--------                     ------   -----------                                -----------
/weather/current             GET      Get current weather for a city             http://localhost:3000/weather/current?location=London
/weather/forecast            GET      Get forecast for a city (1–7 days)        http://localhost:3000/weather/forecast?location=London&days=3
/locations/search            GET      Search for locations by name               http://localhost:3000/locations/search?q=America
/health                      GET      Check server health                        http://localhost:3000/health

How Each Endpoint Works
----------------------
1. Current Weather
   Fetches current temperature, humidity, wind speed, and condition.
   Aggregates results from multiple providers.

2. Forecast
   Returns 1–7 day weather forecast with average temperature, humidity, and condition.

3. Location Search
   Finds cities or towns matching the query.

4. Health Check
   Returns server status and uptime.

Notes
-----
- All API responses are in JSON format.
- Data is cached for 10 minutes (configurable via CACHE_TTL) to reduce provider calls.
- Rate limiting is applied to avoid abuse (RATE_LIMIT_MAX per RATE_LIMIT_WINDOW_MINUTES).
- Use your own API keys from OpenWeather and WeatherAPI for the service to work.
