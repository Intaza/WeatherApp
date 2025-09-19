import { Loader2, CloudRain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = 'Loading weather data...' }: LoadingSpinnerProps) => {
  return (
    <Card className="glass-card border-0 max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <div className="relative mb-6">
          <CloudRain className="h-16 w-16 mx-auto text-primary/30 float-animation" />
          <Loader2 className="h-6 w-6 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
};