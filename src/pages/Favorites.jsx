import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartOff, List, Search as SearchIcon } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import RecipeCard from "../components/recipe/RecipeCard";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

  const filtered = favorites.filter(fav => {
    const matchesSearch = fav.title?.toLowerCase().includes(search.toLowerCase());
    
    let matchesType = filter === "all";
    if (!matchesType && fav.dishTypes) {
      matchesType = fav.dishTypes.some(d => d.toLowerCase().includes(filter.toLowerCase()));
    }
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="animate-in fade-in duration-500 pb-12 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
            My Cookbook 
            <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-sans font-medium">
              {favorites.length} Saved
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">Your personal collection of favorite recipes.</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-32 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/30">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartOff className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-foreground mb-3">No saved recipes yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            Start exploring and click the heart icon to save recipes to your collection.
          </p>
          <Button asChild size="lg" className="rounded-xl px-8 shadow-md">
            <Link to="/search">Discover Recipes</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6 border-t border-border pt-6">
          
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
            
            <div className="relative max-w-md flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search your favorites..." 
                className="pl-9 bg-secondary/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              <Tabs value={filter} onValueChange={setFilter} className="w-auto">
                <TabsList className="bg-secondary/50">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {MEAL_TYPES.map(type => (
                    <TabsTrigger key={type} value={type.toLowerCase()}>{type}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <Button variant="outline" className="gap-2 lg:ml-auto">
              <List className="w-4 h-4" /> Export List
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} size="compact" />
            ))}
            
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No favorites match your current filter.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
