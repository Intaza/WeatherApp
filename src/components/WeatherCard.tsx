import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sunrise, 
  Sunset,
  MapPin
} from 'lucide-react';
import { WeatherData, UserPreferences } from '@/types/weather';
import { formatTemperature, getWindDirection, formatTime, isDay, getWeatherIcon } from '@/utils/weatherHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface WeatherCardProps {
  weather: WeatherData;
  preferences: UserPreferences;
}

export const WeatherCard = ({ weather, preferences }: WeatherCardProps) => {
  const [currentTime, setCurrentTime] = useState('');
  const isDayTime = isDay(weather.dt, weather.sys.sunrise, weather.sys.sunset);
  const weatherCondition = weather.weather[0];

  // Update time every second for real-time updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // weather.timezone is the offset in seconds from UTC
      // Get UTC time and add the timezone offset
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utcTime + (weather.timezone * 1000));
      
      // Get timezone abbreviation based on city and offset
      const getTimezoneAbbreviation = (offsetSeconds: number, cityName: string, country: string) => {
        const offsetHours = offsetSeconds / 3600;
        
        // City-specific timezone mappings
        const cityLower = cityName.toLowerCase();
        const countryLower = country.toLowerCase();
        
        // India
        if (countryLower === 'in' && offsetHours === 5.5) return 'IST';
        
        // United Kingdom
        if (countryLower === 'gb' || countryLower === 'uk') {
          if (offsetHours === 0) return 'GMT';
          if (offsetHours === 1) return 'BST';
        }
        
        // United States
        if (countryLower === 'us') {
          if (offsetHours === -5) return 'EST';
          if (offsetHours === -4) return 'EDT';
          if (offsetHours === -6) return 'CST';
          if (offsetHours === -5) return 'CDT';
          if (offsetHours === -7) return 'MST';
          if (offsetHours === -6) return 'MDT';
          if (offsetHours === -8) return 'PST';
          if (offsetHours === -7) return 'PDT';
        }
        
        // Europe
        if (offsetHours === 1) {
          if (cityLower.includes('london')) return 'BST';
          if (cityLower.includes('berlin') || cityLower.includes('paris') || cityLower.includes('rome')) return 'CET';
        }
        if (offsetHours === 2) {
          if (cityLower.includes('berlin') || cityLower.includes('paris') || cityLower.includes('rome')) return 'CEST';
        }
        
        // Asia
        if (offsetHours === 8) return 'CST'; // China
        if (offsetHours === 9) return 'JST'; // Japan
        if (offsetHours === 3) return 'MSK'; // Russia
        
        // Australia
        if (offsetHours === 10) return 'AEST';
        if (offsetHours === 11) return 'AEDT';
        
        // Brazil
        if (offsetHours === -3) return 'BRT';
        
        // Fallback to GMT offset if no specific timezone found
        const offsetHoursInt = Math.floor(Math.abs(offsetHours));
        const offsetMinutes = Math.floor((Math.abs(offsetSeconds) % 3600) / 60);
        const offsetSign = offsetHours >= 0 ? '+' : '-';
        return `GMT${offsetSign}${offsetHoursInt.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
      };
      
      const timezoneAbbr = getTimezoneAbbreviation(weather.timezone, weather.name, weather.sys.country);
      
      // Format time with timezone abbreviation
      const timeString = localTime.toLocaleString([], {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ` ${timezoneAbbr}`;
      
      setCurrentTime(timeString);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000); // Update every second for real-time

    return () => clearInterval(interval);
  }, [weather.timezone]);
  
  const metrics = [
    {
      icon: Thermometer,
      label: 'Feels like',
      value: formatTemperature(weather.main.feels_like, preferences.temperatureUnit),
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${weather.main.humidity}%`,
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${Math.round(weather.wind.speed * 10) / 10} m/s ${getWindDirection(weather.wind.deg)}`,
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${weather.main.pressure} hPa`,
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${Math.round(weather.visibility / 1000)} km`,
    },
  ];

  return (
    <Card className="glass-card border-0 overflow-hidden">
      <CardContent className="p-6">
        {/* Location and Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">{weather.name}</h2>
              <p className="text-sm text-muted-foreground">{weather.sys.country}</p>
              <p className="text-xs text-muted-foreground">
                {currentTime}
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="capitalize glass px-3 py-1"
          >
            {isDayTime ? 'Day' : 'Night'}
          </Badge>
        </div>

        {/* Main Weather Display */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src={getWeatherIcon(weatherCondition.icon)}
              alt={weatherCondition.description}
              className="w-20 h-20 drop-shadow-lg"
            />
            <div className="text-left">
              <div className="text-5xl font-bold">
                {formatTemperature(weather.main.temp, preferences.temperatureUnit)}
              </div>
              <div className="text-lg text-muted-foreground capitalize">
                {weatherCondition.description}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>High: {formatTemperature(weather.main.temp_max, preferences.temperatureUnit)}</span>
            <span>•</span>
            <span>Low: {formatTemperature(weather.main.temp_min, preferences.temperatureUnit)}</span>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="text-center p-3 rounded-lg glass border border-white/10"
            >
              <metric.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
              <div className="text-sm font-medium">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Sun Times */}
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <Sunrise className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Sunrise:</span>
            <span className="font-medium">{formatTime(weather.sys.sunrise)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sunset className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Sunset:</span>
            <span className="font-medium">{formatTime(weather.sys.sunset)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};