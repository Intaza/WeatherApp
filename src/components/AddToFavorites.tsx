import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherData, FavoriteCity } from '@/types/weather';
import { useToast } from '@/hooks/use-toast';

interface AddToFavoritesProps {
  weather: WeatherData;
  favorites: FavoriteCity[];
  onAddFavorite: (city: FavoriteCity) => void;
  onRemoveFavorite: (cityId: string) => void;
}

export const AddToFavorites = ({ 
  weather, 
  favorites, 
  onAddFavorite, 
  onRemoveFavorite 
}: AddToFavoritesProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const cityId = `${weather.coord.lat}-${weather.coord.lon}`;
  const isFavorite = favorites.some(fav => fav.id === cityId);

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

  return (
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
  );
};