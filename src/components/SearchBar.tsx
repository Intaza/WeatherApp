import { useState, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  onSearch: (query: string, type: 'city' | 'coordinates') => void;
  loading: boolean;
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), 'city');
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setGeoLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onSearch(`${latitude},${longitude}`, 'coordinates');
        setGeoLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = 'Unable to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        
        toast({
          title: 'Location Error',
          description: message,
          variant: 'destructive',
        });
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter city name, ZIP code, or coordinates (lat,lon)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 h-12 text-base glass-card border-0 backdrop-blur-xl"
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            size="lg"
            className="h-12 px-6 glass-card border-0 backdrop-blur-xl hover:scale-105 transition-smooth"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGeolocation}
            className="h-12 px-4 glass-card border-0 backdrop-blur-xl hover:scale-105 transition-smooth"
            disabled={loading || geoLoading}
            title="Use my location"
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      
      <div className="mt-3 text-center">
        <p className="text-sm text-muted-foreground">
          Try "London", "10001", or "40.7128,-74.0060"
        </p>
      </div>
    </div>
  );
};