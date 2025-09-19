import axios from 'axios';
import { WeatherData, ForecastData, AirPollutionData } from '@/types/weather';

// NOTE: Replace with your OpenWeatherMap API key
// Get your free API key at: https://openweathermap.org/api
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  private apiKey: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
  }

  // Check if API key is set
  isConfigured(): boolean {
    return this.apiKey !== 'YOUR_API_KEY_HERE' && this.apiKey.length > 0;
  }

  // Get current weather by city name
  async getCurrentWeatherByCity(city: string, units: string = 'metric'): Promise<WeatherData> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
    }

    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
    }
  }

  // Get current weather by coordinates
  async getCurrentWeatherByCoords(lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
    }

    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
    }
  }

  // Get 5-day forecast
  async getForecast(lat: number, lon: number, units: string = 'metric'): Promise<ForecastData> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
    }

    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
    }
  }

  // Get air pollution data
  async getAirPollution(lat: number, lon: number): Promise<AirPollutionData> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
    }

    try {
      const response = await axios.get(`${BASE_URL}/air_pollution`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      }
      // Air pollution data might not be available for all locations
      throw new Error('Air quality data unavailable for this location');
    }
  }

  // Search cities by name (for autocomplete)
  async searchCities(query: string, limit: number = 5): Promise<any[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
        params: {
          q: query,
          limit,
          appid: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search cities:', error);
      return [];
    }
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;