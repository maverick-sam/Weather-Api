// simple aggregator: average numeric fields across providers; pick first non-empty location; combine forecast per date
function aggregateCurrent(providerResults) {
  // providerResults: array of { provider, location, current }
  const location = providerResults.find(p => p.location)?.location || {};
  const temps = providerResults.map(p => p.current?.temp_c).filter(v => typeof v === 'number');
  const hums = providerResults.map(p => p.current?.humidity).filter(v => typeof v === 'number');
  const windkphs = providerResults.map(p => p.current?.wind_kph).filter(v => typeof v === 'number');

  const avg = (arr) => arr.length ? +(arr.reduce((a,b) => a+b,0)/arr.length).toFixed(2) : null;

  const temp_c = avg(temps);
  const humidity = avg(hums);
  const wind_kph = avg(windkphs);

  // condition: choose most common non-empty condition text
  const conds = providerResults.map(p => p.current?.condition?.text).filter(Boolean);
  const condition = conds.length ? mode(conds) : null;

  return {
    location,
    current: {
      temp_c,
      temp_f: temp_c !== null ? +(temp_c * 9/5 + 32).toFixed(2) : null,
      condition: { text: condition },
      humidity,
      wind_kph
    }
  };
}

function aggregateForecast(providerResults, days = 3) {
  // Build map of date -> [values]
  const dateMap = {};
  let chosenLocation = providerResults.find(p => p.location)?.location || {};

  providerResults.forEach(p => {
    const forecast = p.forecast || [];
    forecast.slice(0, days).forEach(day => {
      if (!dateMap[day.date]) dateMap[day.date] = { temps: [], hums: [], conditions: [] };
      if (typeof day.avg_temp_c === 'number') dateMap[day.date].temps.push(day.avg_temp_c);
      if (typeof day.humidity === 'number') dateMap[day.date].hums.push(day.humidity);
      if (day.condition?.text) dateMap[day.date].conditions.push(day.condition.text);
    });
  });

  const dates = Object.keys(dateMap).slice(0, days);
  const forecast = dates.map(date => {
    const item = dateMap[date];
    const avgTemp = item.temps.length ? +(item.temps.reduce((a,b)=>a+b,0)/item.temps.length).toFixed(2) : null;
    const avgHum = item.hums.length ? +(item.hums.reduce((a,b)=>a+b,0)/item.hums.length).toFixed(2) : null;
    return {
      date,
      avg_temp_c: avgTemp,
      avg_temp_f: avgTemp !== null ? +(avgTemp * 9/5 + 32).toFixed(2) : null,
      condition: { text: item.conditions.length ? mode(item.conditions) : null },
      humidity: avgHum
    };
  });

  return { location: chosenLocation, forecast };
}

// helper: mode (most common string)
function mode(arr) {
  const counts = arr.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
  let max = 0, best = null;
  for (const k of Object.keys(counts)) {
    if (counts[k] > max) { max = counts[k]; best = k; }
  }
  return best;
}

module.exports = { aggregateCurrent, aggregateForecast };
