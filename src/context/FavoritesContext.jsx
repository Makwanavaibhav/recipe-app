import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage("recipe-nest-favorites", []);

  const addFavorite = useCallback((recipe) => {
    setFavorites((prev) => {
      if (prev.find((fav) => fav.id === recipe.id)) return prev;
      toast.success("Added to favorites ❤️");
      return [...prev, recipe];
    });
  }, [setFavorites]);

  const removeFavorite = useCallback((recipeId) => {
    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === recipeId);
      if (exists) {
        toast.success("Removed from favorites");
        return prev.filter((fav) => fav.id !== recipeId);
      }
      return prev;
    });
  }, [setFavorites]);

  const isFavorite = useCallback((recipeId) => {
    return favorites.some((fav) => fav.id === recipeId);
  }, [favorites]);

  const toggleFavorite = useCallback((recipe) => {
    if (isFavorite(recipe.id)) {
      removeFavorite(recipe.id);
    } else {
      addFavorite(recipe);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
