import { useState } from 'react';
import { Heart, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherData, FavoriteCity } from '@/types/weather';
import { useToast } from '@/hooks/use-toast';

interface AddToFavoritesProps {
  weather: WeatherData;
  favorites: FavoriteCity[];
  defaultCity: FavoriteCity | null;
  onAddFavorite: (city: FavoriteCity) => void;
  onRemoveFavorite: (cityId: string) => void;
  onSetDefault: (city: FavoriteCity) => void;
  onClearDefault: () => void;
}

export const AddToFavorites = ({ 
  weather, 
  favorites, 
  defaultCity,
  onAddFavorite, 
  onRemoveFavorite,
  onSetDefault,
  onClearDefault
}: AddToFavoritesProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const cityId = `${weather.coord.lat}-${weather.coord.lon}`;
  const isFavorite = favorites.some(fav => fav.id === cityId);
  const isDefault = defaultCity?.id === cityId;

  const handleToggleFavorite = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      if (isFavorite) {
        onRemoveFavorite(cityId);
        toast({
          title: 'Removed from favorites',
          description: `${weather.name} has been removed from your favorites.`,
        });
      } else {
        const favoriteCity: FavoriteCity = {
          id: cityId,
          name: weather.name,
          country: weather.sys.country,
          coord: weather.coord,
          addedAt: new Date().toISOString(),
        };
        onAddFavorite(favoriteCity);
        toast({
          title: 'Added to favorites',
          description: `${weather.name} has been added to your favorites.`,
        });
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleToggleDefault = () => {
    if (isDefault) {
      onClearDefault();
    } else {
      const favoriteCity: FavoriteCity = {
        id: cityId,
        name: weather.name,
        country: weather.sys.country,
        coord: weather.coord,
        addedAt: new Date().toISOString(),
      };
      onSetDefault(favoriteCity);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleToggleFavorite}
        variant="outline"
        size="sm"
        className={`glass-card border-0 hover:scale-105 transition-smooth ${
          isFavorite ? 'text-destructive hover:text-destructive' : 'hover:text-primary'
        }`}
        disabled={isAnimating}
      >
        <Heart 
          className={`h-4 w-4 transition-all duration-200 ${
            isAnimating ? 'scale-150' : 'scale-100'
          } ${isFavorite ? 'fill-current' : ''}`} 
        />
        <span className="sr-only">
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </span>
      </Button>
      
      <Button
        onClick={handleToggleDefault}
        variant="outline"
        size="sm"
        className={`glass-card border-0 hover:scale-105 transition-smooth ${
          isDefault ? 'text-accent hover:text-accent' : 'hover:text-primary'
        }`}
      >
        {isDefault ? (
          <StarOff className="h-4 w-4" />
        ) : (
          <Star className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isDefault ? 'Remove as default city' : 'Set as default city'}
        </span>
      </Button>
    </div>
  );
};