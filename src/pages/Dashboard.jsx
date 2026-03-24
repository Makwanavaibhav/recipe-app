import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Calendar, Heart, ChefHat } from "lucide-react";
import { getRandomRecipes, searchRecipes } from "../api/spoonacular";
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeCardSkeleton from "../components/recipe/RecipeCardSkeleton";
import { useFavorites } from "../context/FavoritesContext";
import { useMealPlan, getCurrentWeekKey } from "../context/MealPlanContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { getWeekPlan } = useMealPlan();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingSeasonal, setLoadingSeasonal] = useState(true);

  // Stats calculation
  const weekPlan = getWeekPlan(getCurrentWeekKey());
  const plannedMealsCount = Object.values(weekPlan).reduce((acc, day) => acc + Object.keys(day).length, 0);

  // Determine season
  const month = new Date().getMonth();
  let season = "Spring";
  let seasonKeyword = "spring salads";
  if (month >= 2 && month <= 4) { season = "Spring"; seasonKeyword = "spring"; }
  else if (month >= 5 && month <= 7) { season = "Summer"; seasonKeyword = "summer grill"; }
  else if (month >= 8 && month <= 10) { season = "Autumn"; seasonKeyword = "autumn squash"; }
  else { season = "Winter"; seasonKeyword = "winter soup"; }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch featured
        setLoadingFeatured(true);
        const featuredData = await getRandomRecipes("main course", 6);
        if (featuredData?.recipes) setFeatured(featuredData.recipes);
        setLoadingFeatured(false);

        // Fetch seasonal
        setLoadingSeasonal(true);
        const seasonalData = await searchRecipes({ query: seasonKeyword, number: 4, addRecipeInformation: true });
        if (seasonalData?.results) setSeasonal(seasonalData.results);
        setLoadingSeasonal(false);
      } catch (error) {
        console.error("Dashboard error:", error);
        setLoadingFeatured(false);
        setLoadingSeasonal(false);
      }
    };

    fetchDashboardData();
  }, [seasonKeyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-secondary border border-border px-6 py-16 md:py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
            What are you <span className="text-primary italic pr-2">cooking</span> tonight?
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Discover thousands of recipes, plan your week, and save your favorites in your personal collection.
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mt-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Search recipes, ingredients, or cuisines..." 
              className="w-full pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-border focus-visible:ring-primary shadow-sm bg-background/80 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Quick Stats Strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Recipes Saved", value: favorites.length, icon: Heart },
          { label: "Meals Planned This Week", value: plannedMealsCount, icon: Calendar },
          { label: "Inspired Collections", value: "3", icon: ChefHat },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold font-serif">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Featured Recipes */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Featured Picks</h2>
          <Link to="/search" className="text-primary font-medium hover:underline text-sm block">
            View All
          </Link>
        </div>
        
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-3 md:overflow-visible md:p-0 md:mx-0 gap-6 snap-x">
          {loadingFeatured 
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="w-[80vw] md:w-auto flex-shrink-0 snap-center">
                  <RecipeCardSkeleton />
                </div>
              ))
            : featured.map((recipe) => (
                <div key={recipe.id} className="w-[80vw] md:w-auto flex-shrink-0 snap-center">
                  <RecipeCard recipe={recipe} />
                </div>
              ))
          }
        </div>
      </section>

      {/* Seasonal Suggestions & Meal Planner Teaser Container */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Seasonal Grid */}
        <section className="md:col-span-2 space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            {season} Inspiration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loadingSeasonal
              ? Array(4).fill(0).map((_, i) => <RecipeCardSkeleton key={i} size="compact" />)
              : seasonal.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} size="compact" />)
            }
          </div>
        </section>

        {/* Meal Planner Teaser */}
        <section className="md:col-span-1 space-y-6 sticky top-24">
          <h2 className="text-2xl font-serif font-bold text-foreground">This Week</h2>
          <Card className="border-border bg-card shadow-sm overflow-hidden border-t-4 border-t-primary">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-serif font-bold text-foreground">Meal Planner</h3>
                <p className="text-muted-foreground text-sm">
                  You have <strong>{plannedMealsCount}</strong> meals planned for this week.
                  Organize your recipes into a beautiful drag-and-drop calendar.
                </p>
              </div>
              <Button asChild className="w-full mt-4" size="lg">
                <Link to="/planner">Open Planner</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

    </div>
  );
}
