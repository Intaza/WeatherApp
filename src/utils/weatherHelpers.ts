import { WeatherData } from '@/types/weather';

export const convertTemperature = (celsius: number, unit: 'celsius' | 'fahrenheit'): number => {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
};

export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit'): string => {
  const converted = convertTemperature(temp, unit);
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${Math.round(converted)}${symbol}`;
};

export const getWeatherBackground = (weatherMain: string, isDay: boolean): string => {
  const weather = weatherMain.toLowerCase();
  
  if (!isDay) return 'weather-night';
  
  switch (weather) {
    case 'clear':
      return 'weather-clear';
    case 'clouds':
      return 'weather-cloudy';
    case 'rain':
    case 'drizzle':
    case 'thunderstorm':
      return 'weather-rainy';
    case 'snow':
      return 'weather-snow';
    default:
      return isDay ? 'weather-clear' : 'weather-night';
  }
};

export const isDay = (current: number, sunrise: number, sunset: number): boolean => {
  return current >= sunrise && current < sunset;
};

export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const getAQILevel = (aqi: number): { label: string; color: string; description: string } => {
  switch (aqi) {
    case 1:
      return { label: 'Good', color: 'aqi-good', description: 'Air quality is satisfactory' };
    case 2:
      return { label: 'Fair', color: 'aqi-moderate', description: 'Air quality is acceptable' };
    case 3:
      return { label: 'Moderate', color: 'aqi-unhealthySensitive', description: 'Members of sensitive groups may experience health effects' };
    case 4:
      return { label: 'Poor', color: 'aqi-unhealthy', description: 'Everyone may begin to experience health effects' };
    case 5:
      return { label: 'Very Poor', color: 'aqi-veryUnhealthy', description: 'Health warnings of emergency conditions' };
    default:
      return { label: 'Unknown', color: 'muted', description: 'AQI data unavailable' };
  }
};

export const getWeatherIcon = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Custom AQI calculation using US EPA breakpoints for PM2.5 and PM10 in μg/m³
// Returns the maximum sub-index across pollutants and maps to a 1-5 scale
type AQIComputationResult = {
  categoryIndex: number; // 1-5 for UI
  aqi: number; // 0-500 US AQI index approximation
  dominantPollutant: 'pm2_5' | 'pm10';
};

function calcSubIndex(value: number, bps: Array<{ concLow: number; concHigh: number; aqiLow: number; aqiHigh: number }>): number {
  for (const bp of bps) {
    if (value >= bp.concLow && value <= bp.concHigh) {
      // Linear interpolation per EPA formula
      const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.concHigh - bp.concLow)) * (value - bp.concLow) + bp.aqiLow;
      return Math.round(aqi);
    }
  }
  // Above highest breakpoint
  const last = bps[bps.length - 1];
  if (value > last.concHigh) {
    const aqi = ((last.aqiHigh - last.aqiLow) / (last.concHigh - last.concLow)) * (value - last.concLow) + last.aqiLow;
    return Math.round(Math.min(500, aqi));
  }
  return 0;
}

const PM25_BREAKPOINTS = [
  { concLow: 0.0, concHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
  { concLow: 12.1, concHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
  { concLow: 35.5, concHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
  { concLow: 55.5, concHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
  { concLow: 150.5, concHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
  { concLow: 250.5, concHigh: 500.4, aqiLow: 301, aqiHigh: 500 },
];

const PM10_BREAKPOINTS = [
  { concLow: 0, concHigh: 54, aqiLow: 0, aqiHigh: 50 },
  { concLow: 55, concHigh: 154, aqiLow: 51, aqiHigh: 100 },
  { concLow: 155, concHigh: 254, aqiLow: 101, aqiHigh: 150 },
  { concLow: 255, concHigh: 354, aqiLow: 151, aqiHigh: 200 },
  { concLow: 355, concHigh: 424, aqiLow: 201, aqiHigh: 300 },
  { concLow: 425, concHigh: 604, aqiLow: 301, aqiHigh: 500 },
];

export function computeCustomAQI(components: {
  pm2_5: number;
  pm10: number;
}): AQIComputationResult {
  const pm25Index = calcSubIndex(components.pm2_5, PM25_BREAKPOINTS);
  const pm10Index = calcSubIndex(components.pm10, PM10_BREAKPOINTS);
  const aqi = Math.max(pm25Index, pm10Index);
  const dominantPollutant = pm25Index >= pm10Index ? 'pm2_5' : 'pm10';

  let categoryIndex = 1;
  if (aqi <= 50) categoryIndex = 1; // Good
  else if (aqi <= 100) categoryIndex = 2; // Fair
  else if (aqi <= 150) categoryIndex = 3; // Moderate
  else if (aqi <= 200) categoryIndex = 4; // Poor
  else categoryIndex = 5; // Very Poor

  return { categoryIndex, aqi, dominantPollutant };
}