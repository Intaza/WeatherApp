import { Button } from '@/components/ui/button';
import { UserPreferences } from '@/types/weather';

interface TemperatureToggleProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const TemperatureToggle = ({ preferences, onUpdatePreferences }: TemperatureToggleProps) => {
  const toggleUnit = () => {
    const newUnit = preferences.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    onUpdatePreferences({ temperatureUnit: newUnit });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleUnit}
      className="glass-card border-0 hover:scale-105 transition-smooth"
    >
      °{preferences.temperatureUnit === 'celsius' ? 'C' : 'F'}
    </Button>
  );
};