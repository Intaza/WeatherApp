import { ForecastData, UserPreferences } from '@/types/weather';
import { convertTemperature } from '@/utils/weatherHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface WeatherChartProps {
  forecast: ForecastData;
  preferences: UserPreferences;
}

interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  day: string;
}

/**
 * Helper: format an item.dt (UTC seconds) into the city's local time label.
 * We shift the epoch by tzOffsetSec, then read the UTC components of that shifted epoch
 * (this avoids relying on the browser's timezone).
 */
const formatLocalLabel = (utcSeconds: number, tzOffsetSec: number) => {
  const shifted = new Date((utcSeconds + tzOffsetSec) * 1000); // shifted epoch
  // 12-hour clock with AM/PM (matches the earlier toLocaleTimeString behavior)
  let hh = shifted.getUTCHours();
  const mm = shifted.getUTCMinutes();
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(mm).padStart(2, '0')} ${ampm}`;
};

const formatLocalDayShort = (utcSeconds: number, tzOffsetSec: number) => {
  const shifted = new Date((utcSeconds + tzOffsetSec) * 1000);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[shifted.getUTCDay()];
};

export const WeatherChart = ({ forecast, preferences }: WeatherChartProps) => {
  // timezone offset in seconds provided by OpenWeather (can be negative)
  const tzOffsetSec = forecast.city?.timezone ?? 0;

  // Current UTC timestamp in seconds
  const nowUTC = Math.floor(Date.now() / 1000);

  // Current city-local timestamp in seconds
  const nowLocal = nowUTC + tzOffsetSec;

  // ----- Choose rounding behavior -----
  // Option A: nearest 3-hour slot (Math.round) -> snaps to closest slot (past or future)
  const roundedLocal = Math.round(nowLocal / (3 * 3600)) * (3 * 3600);

  // Option B (uncomment to always snap forward to the next slot):
  // const roundedLocal = Math.ceil(nowLocal / (3 * 3600)) * (3 * 3600);

  // Convert roundedLocal (local seconds) back to UTC seconds for direct comparison with item.dt (which is UTC)
  const targetUTCforCompare = roundedLocal - tzOffsetSec;

  // Find forecast entry whose UTC timestamp is closest to targetUTCforCompare
  let startIndex = 0;
  let minDiff = Infinity;
  forecast.list.forEach((item, idx) => {
    const diff = Math.abs(item.dt - targetUTCforCompare);
    if (diff < minDiff) {
      minDiff = diff;
      startIndex = idx;
    }
  });

  // Build next 8 entries (wrap around if necessary)
  const nextEight = Array.from({ length: 8 }, (_, i) => {
    return forecast.list[(startIndex + i) % forecast.list.length];
  });

  // Debug logs (open console to inspect)
  console.log('Now UTC:', new Date(nowUTC * 1000).toISOString());
  console.log('Now (city local):', new Date((nowLocal) * 1000).toISOString());
  console.log('Rounded local slot (city):', new Date((roundedLocal) * 1000).toISOString());
  console.log('targetUTCforCompare:', new Date(targetUTCforCompare * 1000).toISOString());
  console.log('Selected start index:', startIndex);
  console.log(
    'Next 8 entries (city local labels):',
    nextEight.map((it) => ({
      utc: new Date(it.dt * 1000).toISOString(),
      localLabel: formatLocalLabel(it.dt, tzOffsetSec),
      localIsoLike: new Date((it.dt + tzOffsetSec) * 1000).toUTCString(), // for debugging only
    }))
  );

  const chartData: ChartDataPoint[] = nextEight.map((item) => {
    const temp = convertTemperature(item.main.temp, preferences.temperatureUnit);
    return {
      time: formatLocalLabel(item.dt, tzOffsetSec),
      temperature: Math.round(temp),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      day: formatLocalDayShort(item.dt, tzOffsetSec),
    };
  });

  const tempUnit = preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20 rounded-lg backdrop-blur-xl">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'temperature' ? tempUnit : entry.dataKey === 'humidity' ? '%' : ' m/s'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Weather Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temperature" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="temperature" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Temperature
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Conditions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}${tempUnit}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="mt-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="humidity" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} opacity={0.8} name="Humidity" />
                  <Bar dataKey="windSpeed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} opacity={0.8} name="Wind Speed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-info opacity-80"></div>
                <span>Humidity (%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent opacity-80"></div>
                <span>Wind Speed (m/s)</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
