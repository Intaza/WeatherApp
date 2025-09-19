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

interface WeatherCardProps {
  weather: WeatherData;
  preferences: UserPreferences;
}

export const WeatherCard = ({ weather, preferences }: WeatherCardProps) => {
  const isDayTime = isDay(weather.dt, weather.sys.sunrise, weather.sys.sunset);
  const weatherCondition = weather.weather[0];
  
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
      value: `${Math.round(weather.wind.speed)} m/s ${getWindDirection(weather.wind.deg)}`,
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