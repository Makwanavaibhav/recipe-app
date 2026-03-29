import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { useFavorites } from "../../context/FavoritesContext";
import { cn } from "../../lib/utils";

export default function FavoriteButton({ recipe, variant = "default", className }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  return (
    <Button
      variant={variant === "outline" ? "outline" : "secondary"}
      size="icon"
      className={cn(
        "rounded-full transition-all duration-300 hover:scale-110",
        favorited ? "bg-primary/10 hover:bg-primary/20" : "",
        className
      )}
      onClick={(e) => {
        e.preventDefault(); 
        e.stopPropagation();
        toggleFavorite(recipe);
      }}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-colors duration-300",
          favorited ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
