import { ForecastData, UserPreferences } from '@/types/weather';
import { convertTemperature } from '@/utils/weatherHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

export const WeatherChart = ({ forecast, preferences }: WeatherChartProps) => {
  // Process forecast data for charts
  const chartData: ChartDataPoint[] = forecast.list.slice(0, 8).map(item => {
    const date = new Date(item.dt * 1000);
    const temp = convertTemperature(item.main.temp, preferences.temperatureUnit);
    
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(temp),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      day: date.toLocaleDateString([], { weekday: 'short' }),
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
              {entry.dataKey === 'temperature' ? tempUnit : 
               entry.dataKey === 'humidity' ? '%' : 
               entry.dataKey === 'windSpeed' ? ' m/s' : ''}
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
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
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
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="humidity" 
                    fill="hsl(var(--info))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                    name="Humidity"
                  />
                  <Bar 
                    dataKey="windSpeed" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                    name="Wind Speed"
                  />
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