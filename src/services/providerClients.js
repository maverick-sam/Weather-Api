const axios = require('axios');

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

async function fetchOpenWeatherCurrent(location) {
  if (!OPENWEATHER_KEY) throw new Error('OPENWEATHER_API_KEY not set');
  const url = `http://api.openweathermap.org/data/2.5/weather`;
  const resp = await axios.get(url, { params: { q: location, appid: OPENWEATHER_KEY, units: 'metric' }, timeout: 8000 });
  const d = resp.data;
  // transform to common shape
  return {
    provider: 'openweathermap',
    raw: d,
    location: { name: d.name, lat: d.coord?.lat, lon: d.coord?.lon, country: d.sys?.country },
    current: {
      temp_c: d.main?.temp,
      temp_f: d.main?.temp ? +(d.main.temp * 9/5 + 32).toFixed(2) : null,
      condition: { text: d.weather?.[0]?.description, icon: d.weather?.[0]?.icon },
      humidity: d.main?.humidity,
      pressure_mb: d.main?.pressure,
      wind_kph: d.wind?.speed ? +(d.wind.speed * 3.6).toFixed(2) : null,
      wind_degree: d.wind?.deg ?? null
    }
  };
}

async function fetchWeatherAPICurrent(location) {
  if (!WEATHERAPI_KEY) throw new Error('WEATHERAPI_KEY not set');
  const url = `http://api.weatherapi.com/v1/current.json`;
  const resp = await axios.get(url, { params: { key: WEATHERAPI_KEY, q: location }, timeout: 8000 });
  const d = resp.data;
  return {
    provider: 'weatherapi',
    raw: d,
    location: { name: d.location?.name, lat: d.location?.lat, lon: d.location?.lon, country: d.location?.country },
    current: {
      temp_c: d.current?.temp_c,
      temp_f: d.current?.temp_f,
      condition: { text: d.current?.condition?.text, icon: d.current?.condition?.icon },
      humidity: d.current?.humidity,
      pressure_mb: d.current?.pressure_mb,
      wind_kph: d.current?.wind_kph,
      wind_degree: d.current?.wind_degree
    }
  };
}

async function fetchOpenWeatherForecast(location, days = 3) {
  if (!OPENWEATHER_KEY) throw new Error('OPENWEATHER_API_KEY not set');
  // OpenWeather 5-day/3-hr forecast -> aggregate by date
  const url = `http://api.openweathermap.org/data/2.5/forecast`;
  const resp = await axios.get(url, { params: { q: location, appid: OPENWEATHER_KEY, units: 'metric' }, timeout: 10000 });
  const d = resp.data;
  // aggregate into daily buckets
  const daysMap = {};
  (d.list || []).forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().slice(0,10);
    if (!daysMap[date]) daysMap[date] = [];
    daysMap[date].push(item);
  });
  const keys = Object.keys(daysMap).slice(0, days);
  const forecast = keys.map(date => {
    const arr = daysMap[date];
    const temps = arr.map(i => i.main?.temp).filter(t => t !== undefined);
    const humid = arr.map(i => i.main?.humidity).filter(t => t !== undefined);
    const avgTemp = temps.length ? temps.reduce((a,b)=>a+b,0)/temps.length : null;
    const avgHum = humid.length ? humid.reduce((a,b)=>a+b,0)/humid.length : null;
    const weather = arr[0]?.weather?.[0];
    return {
      date,
      avg_temp_c: avgTemp,
      avg_temp_f: avgTemp ? +(avgTemp * 9/5 + 32).toFixed(2) : null,
      condition: { text: weather?.description, icon: weather?.icon },
      humidity: avgHum
    };
  });

  return {
    provider: 'openweathermap',
    raw: d,
    location: { name: d.city?.name, lat: d.city?.coord?.lat, lon: d.city?.coord?.lon, country: d.city?.country },
    forecast
  };
}

async function fetchWeatherAPIForecast(location, days = 3) {
  if (!WEATHERAPI_KEY) throw new Error('WEATHERAPI_KEY not set');
  const url = `http://api.weatherapi.com/v1/forecast.json`;
  const resp = await axios.get(url, { params: { key: WEATHERAPI_KEY, q: location, days }, timeout: 10000 });
  const d = resp.data;
  const forecast = (d.forecast?.forecastday || []).map(f => ({
    date: f.date,
    avg_temp_c: f.day?.avgtemp_c,
    avg_temp_f: f.day?.avgtemp_f,
    condition: { text: f.day?.condition?.text, icon: f.day?.condition?.icon },
    humidity: f.day?.avghumidity
  }));

  return {
    provider: 'weatherapi',
    raw: d,
    location: { name: d.location?.name, lat: d.location?.lat, lon: d.location?.lon, country: d.location?.country },
    forecast
  };
}

async function fetchWeatherAPILocations(query) {
  if (!WEATHERAPI_KEY) throw new Error('WEATHERAPI_KEY not set');
  const url = `http://api.weatherapi.com/v1/search.json`;
  const resp = await axios.get(url, { params: { key: WEATHERAPI_KEY, q: query }, timeout: 8000 });
  // resp.data is array of locations
  return (resp.data || []).map(x => ({ name: x.name, region: x.region, country: x.country, lat: x.lat, lon: x.lon }));
}

module.exports = {
  fetchOpenWeatherCurrent,
  fetchWeatherAPICurrent,
  fetchOpenWeatherForecast,
  fetchWeatherAPIForecast,
  fetchWeatherAPILocations
};
