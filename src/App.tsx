import { useState, useEffect } from 'react';
import { WeatherData, ForecastData, AirPollutionData, FavoriteCity, UserPreferences } from '@/types/weather';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { weatherService } from '@/services/weatherService';
import { getWeatherBackground, isDay } from '@/utils/weatherHelpers';
import { useToast } from '@/hooks/use-toast';

import { SearchBar } from '@/components/SearchBar';
import { WeatherCard } from '@/components/WeatherCard';
import { ForecastCard } from '@/components/ForecastCard';
import { WeatherChart } from '@/components/WeatherChart';
import { Favorites } from '@/components/Favorites';
import { AirQuality } from '@/components/AirQuality';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TemperatureToggle } from '@/components/TemperatureToggle';
import { AddToFavorites } from '@/components/AddToFavorites';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Cloud, AlertCircle } from 'lucide-react';

function App() {
  // State management
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [airQuality, setAirQuality] = useState<AirPollutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backgroundClass, setBackgroundClass] = useState('weather-clear');

  // Persistent data
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>('weather-favorites', []);
  const [defaultCity, setDefaultCity] = useLocalStorage<FavoriteCity | null>('weather-default-city', null);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('weather-preferences', {
    temperatureUnit: 'celsius',
    language: 'en',
    theme: 'system',
  });

  const { toast } = useToast();

  // Initialize theme on app start
  useEffect(() => {
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      const root = window.document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      } else {
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      }
    };

    applyTheme(preferences.theme);

    // Listen for system theme changes when using system mode
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme]);

  // Update background based on weather
  useEffect(() => {
    if (weather) {
      const isDayTime = isDay(weather.dt, weather.sys.sunrise, weather.sys.sunset);
      const bgClass = getWeatherBackground(weather.weather[0].main, isDayTime);
      setBackgroundClass(bgClass);
    }
  }, [weather]);

  // Check API key configuration
  const isApiConfigured = weatherService.isConfigured();

  // Search weather data
  const searchWeather = async (query: string, type: 'city' | 'coordinates') => {
    if (!isApiConfigured) {
      setError('API key not configured. Please add your OpenWeatherMap API key to the weatherService.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let weatherData: WeatherData;
      
      if (type === 'coordinates') {
        const [lat, lon] = query.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error('Invalid coordinates format. Use: latitude,longitude');
        }
        weatherData = await weatherService.getCurrentWeatherByCoords(lat, lon);
      } else {
        weatherData = await weatherService.getCurrentWeatherByCity(query);
      }
      
      setWeather(weatherData);

      // Fetch forecast and air quality data in parallel
      const [forecastData, aqData] = await Promise.allSettled([
        weatherService.getForecast(weatherData.coord.lat, weatherData.coord.lon),
        weatherService.getAirPollution(weatherData.coord.lat, weatherData.coord.lon)
      ]);

      if (forecastData.status === 'fulfilled') {
        setForecast(forecastData.value);
      } else {
        console.warn('Failed to fetch forecast:', forecastData.reason);
      }

      if (aqData.status === 'fulfilled') {
        setAirQuality(aqData.value);
      } else {
        console.warn('Failed to fetch air quality:', aqData.reason);
        setAirQuality(null);
      }

      toast({
        title: 'Weather updated',
        description: `Showing weather for ${weatherData.name}, ${weatherData.sys.country}`,
      });

    } catch (err: any) {
      setError(err.message);
      setWeather(null);
      setForecast(null);
      setAirQuality(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle favorite city selection
  const handleFavoriteSelect = (city: FavoriteCity) => {
    searchWeather(`${city.coord.lat},${city.coord.lon}`, 'coordinates');
  };

  // Add city to favorites
  const addToFavorites = (city: FavoriteCity) => {
    setFavorites(prev => [...prev, city]);
  };

  // Remove city from favorites
  const removeFromFavorites = (cityId: string) => {
    setFavorites(prev => prev.filter(city => city.id !== cityId));
  };

  // Update user preferences
  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  // Set default city
  const setAsDefaultCity = (city: FavoriteCity) => {
    setDefaultCity(city);
    toast({
      title: 'Default city set',
      description: `${city.name}, ${city.country} is now your default city`,
    });
  };

  // Clear default city
  const clearDefaultCity = () => {
    setDefaultCity(null);
    toast({
      title: 'Default city cleared',
      description: 'No default city set',
    });
  };

  // Retry function for error display
  const retryLastSearch = () => {
    if (weather) {
      searchWeather(`${weather.coord.lat},${weather.coord.lon}`, 'coordinates');
    }
  };

  // Load default city or demo weather on first visit
  useEffect(() => {
    if (!weather && !loading && !error && isApiConfigured) {
      if (defaultCity) {
        // Load user's default city
        searchWeather(`${defaultCity.coord.lat},${defaultCity.coord.lon}`, 'coordinates');
      } else {
        // Load London as demo if no default city set
        searchWeather('London', 'city');
      }
    }
  }, [defaultCity]);

  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Cloud className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              How's the weather?
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <ThemeToggle 
              preferences={preferences} 
              onUpdatePreferences={updatePreferences} 
            />
            <TemperatureToggle 
              preferences={preferences} 
              onUpdatePreferences={updatePreferences} 
            />
            {weather && (
              <AddToFavorites
                weather={weather}
                favorites={favorites}
                defaultCity={defaultCity}
                onAddFavorite={addToFavorites}
                onRemoveFavorite={removeFromFavorites}
                onSetDefault={setAsDefaultCity}
                onClearDefault={clearDefaultCity}
              />
            )}
          </div>

          <SearchBar onSearch={searchWeather} loading={loading} />
        </header>

        {/* API Key Warning */}
        {!isApiConfigured && (
          <Card className="glass-card border-0 max-w-2xl mx-auto border-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-warning">API Key Required</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                To use this Weather Dashboard, you need to add your OpenWeatherMap API key. 
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Steps to get started:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Get a free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenWeatherMap</a></li>
                  <li>Open <code className="bg-muted px-1 rounded">src/services/weatherService.ts</code></li>
                  <li>Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY_HERE</code> with your API key</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <Favorites
            favorites={favorites}
            onSelectFavorite={handleFavoriteSelect}
            onRemoveFavorite={removeFromFavorites}
            isLoading={loading}
          />
        )}

        {/* Loading State */}
        {loading && (
          <LoadingSpinner message="Fetching weather data..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorDisplay
            title="Weather Data Error"
            message={error}
            onRetry={retryLastSearch}
            showRetry={!!weather}
          />
        )}

        {/* Weather Content */}
        {weather && !loading && !error && (
          <div className="space-y-8">
            {/* Current Weather */}
            <WeatherCard weather={weather} preferences={preferences} />

            {/* Forecast and Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {forecast && (
                <>
                  <ForecastCard forecast={forecast} preferences={preferences} />
                  <WeatherChart forecast={forecast} preferences={preferences} />
                </>
              )}
            </div>

            {/* Air Quality */}
            <AirQuality airQuality={airQuality} loading={false} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-white/80">
          <p className="text-sm">
            Powered by{' '}
            <a 
              href="https://openweathermap.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              OpenWeatherMap
            </a>
            {' • '}
            Built with React & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
