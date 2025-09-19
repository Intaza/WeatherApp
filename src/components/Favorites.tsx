import { FavoriteCity } from '@/types/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, X, Clock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface FavoritesProps {
  favorites: FavoriteCity[];
  onSelectFavorite: (city: FavoriteCity) => void;
  onRemoveFavorite: (cityId: string) => void;
  isLoading?: boolean;
}

export const Favorites = ({ 
  favorites, 
  onSelectFavorite, 
  onRemoveFavorite,
  isLoading = false 
}: FavoritesProps) => {
  if (favorites.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">No favorite cities yet</p>
          <p className="text-sm text-muted-foreground">
            Search for a city and add it to your favorites for quick access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" />
          Favorite Cities
          <Badge variant="secondary" className="ml-auto">
            {favorites.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-3 pb-4">
            {favorites.map((city) => (
              <div
                key={city.id}
                className="flex-shrink-0 w-48 p-4 rounded-lg glass border border-white/10 hover:scale-105 transition-smooth group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{city.name}</h3>
                      <p className="text-xs text-muted-foreground">{city.country}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(city.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Added {new Date(city.addedAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {city.coord.lat.toFixed(2)}, {city.coord.lon.toFixed(2)}
                  </div>
                </div>

                <Button
                  onClick={() => onSelectFavorite(city)}
                  disabled={isLoading}
                  className="w-full h-8 text-xs glass hover:bg-primary/20"
                  variant="outline"
                >
                  View Weather
                </Button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};