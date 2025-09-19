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