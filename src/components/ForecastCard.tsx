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
  // Group by local day using city timezone and compute representative stats
  const timezoneOffsetSec = forecast.city?.timezone ?? 0;
  const groups: Record<string, any[]> = {};

  forecast.list.forEach((item) => {
    const localMs = (item.dt + timezoneOffsetSec) * 1000;
    const localDate = new Date(localMs);
    const key = localDate.toISOString().slice(0, 10); // YYYY-MM-DD in local offset frame
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const dailyForecast = Object.entries(groups)
    .slice(0, 5)
    .map(([key, items]) => {
      // Pick the slot closest to 12:00 local time
      const targetHour = 12;
      const withLocal = items.map((it) => {
        const localMs = (it.dt + timezoneOffsetSec) * 1000;
        const d = new Date(localMs);
        return { original: it, date: d, hourDiff: Math.abs(d.getHours() - targetHour) };
      });
      withLocal.sort((a, b) => a.hourDiff - b.hourDiff);
      const representative = withLocal[0].original;

      // Compute max/min temps, average humidity and wind speed for the day
      const tempMax = Math.max(...items.map((it: any) => it.main.temp_max));
      const tempMin = Math.min(...items.map((it: any) => it.main.temp_min));
      const avgHumidity = Math.round(
        items.reduce((sum: number, it: any) => sum + it.main.humidity, 0) / items.length
      );
      const avgWind = items.reduce((sum: number, it: any) => sum + it.wind.speed, 0) / items.length;

      return {
        date: key,
        timestamp: representative.dt,
        weather: representative.weather[0],
        temp_max: tempMax,
        temp_min: tempMin,
        humidity: avgHumidity,
        wind_speed: avgWind,
      };
    })
    .slice(0, 5);

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
                    💨 {Math.round(day.wind_speed * 10) / 10} m/s
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