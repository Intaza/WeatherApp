import { AirPollutionData } from '@/types/weather';
import { computeCustomAQI, getAQILevel } from '@/utils/weatherHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, AlertTriangle } from 'lucide-react';

interface AirQualityProps {
  airQuality: AirPollutionData | null;
  loading?: boolean;
}

export const AirQuality = ({ airQuality, loading = false }: AirQualityProps) => {
  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="h-5 w-5 text-primary" />
            <div className="h-5 w-32 loading-shimmer rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full loading-shimmer rounded"></div>
            <div className="h-4 w-3/4 loading-shimmer rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!airQuality || !airQuality.list.length) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Air quality data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const currentAQI = airQuality.list[0];
  // Use custom AQI derived from concentrations for finer city differences
  const custom = computeCustomAQI({
    pm2_5: currentAQI.components.pm2_5,
    pm10: currentAQI.components.pm10,
  });
  const aqiInfo = getAQILevel(custom.categoryIndex);
  
  const pollutants = [
    { name: 'PM2.5', value: currentAQI.components.pm2_5.toFixed(1), unit: 'μg/m³' },
    { name: 'PM10', value: currentAQI.components.pm10.toFixed(1), unit: 'μg/m³' },
    { name: 'NO₂', value: currentAQI.components.no2.toFixed(1), unit: 'μg/m³' },
    { name: 'O₃', value: currentAQI.components.o3.toFixed(1), unit: 'μg/m³' },
    { name: 'CO', value: (currentAQI.components.co / 1000).toFixed(1), unit: 'mg/m³' },
    { name: 'SO₂', value: currentAQI.components.so2.toFixed(1), unit: 'μg/m³' },
  ];

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            Air Quality Index
          </div>
          <Badge 
            variant="secondary" 
            className={`bg-${aqiInfo.color} text-white border-0`}
          >
            {aqiInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AQI Score */}
        <div className="text-center p-4 rounded-lg glass border border-white/10">
          <div className="text-3xl font-bold mb-2">{custom.categoryIndex}/5</div>
          <p className="text-sm text-muted-foreground">{aqiInfo.description}</p>
          <div className="text-xs text-muted-foreground mt-1">US AQI: {custom.aqi} · Dominant: {custom.dominantPollutant.toUpperCase()}</div>
        </div>

        {/* Pollutant Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {pollutants.map((pollutant) => (
            <div 
              key={pollutant.name}
              className="text-center p-3 rounded-lg glass border border-white/10"
            >
              <div className="text-xs text-muted-foreground mb-1">{pollutant.name}</div>
              <div className="font-medium text-sm">
                {pollutant.value} <span className="text-xs text-muted-foreground">{pollutant.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Health Recommendation */}
        <div className="p-4 rounded-lg glass border border-white/10 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Health Advice</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {custom.categoryIndex <= 2 
              ? "Good air quality. Perfect for outdoor activities."
              : custom.categoryIndex === 3
              ? "Moderate air quality. Sensitive individuals should limit prolonged outdoor activities."
              : "Poor air quality. Consider staying indoors and avoiding strenuous outdoor activities."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};