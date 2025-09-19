import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorDisplay = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  showRetry = true 
}: ErrorDisplayProps) => {
  return (
    <Card className="glass-card border-0 max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{message}</p>
        
        {showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="glass-card border-0 hover:scale-105 transition-smooth"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};