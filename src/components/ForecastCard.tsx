import { ForecastData, UserPreferences } from '@/types/weather';
import { formatTemperature, formatDate, getWeatherIcon } from '@/utils/weatherHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CalendarDays } from 'lucide-react';

interface ForecastCardProps {
  forecast: ForecastData;
  preferences: UserPreferences;
}

export const ForecastCard = ({ forecast, preferences }: ForecastCardProps) => {
  // Group forecast by day and get midday reading for each day
  const dailyForecast = forecast.list.reduce((acc: any[], item) => {
    const date = new Date(item.dt * 1000).toDateString();
    const existingDay = acc.find(day => day.date === date);
    
    if (!existingDay) {
      acc.push({
        date,
        timestamp: item.dt,
        weather: item.weather[0],
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
      });
    } else {
      // Update max/min temperatures
      existingDay.temp_max = Math.max(existingDay.temp_max, item.main.temp_max);
      existingDay.temp_min = Math.min(existingDay.temp_min, item.main.temp_min);
    }
    
    return acc;
  }, []).slice(0, 5); // Only show 5 days

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          5-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {dailyForecast.map((day, index) => (
              <div 
                key={day.timestamp}
                className="flex-shrink-0 w-32 text-center p-4 rounded-lg glass border border-white/10 hover:scale-105 transition-smooth"
              >
                <div className="text-sm font-medium mb-2">
                  {index === 0 ? 'Today' : formatDate(day.timestamp)}
                </div>
                
                <img
                  src={getWeatherIcon(day.weather.icon)}
                  alt={day.weather.description}
                  className="w-12 h-12 mx-auto mb-2"
                />
                
                <div className="text-xs text-muted-foreground capitalize mb-3">
                  {day.weather.main}
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    {formatTemperature(day.temp_max, preferences.temperatureUnit)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTemperature(day.temp_min, preferences.temperatureUnit)}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    💧 {day.humidity}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    💨 {Math.round(day.wind_speed)} m/s
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};