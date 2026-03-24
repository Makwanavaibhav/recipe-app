import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Filter, X, ChevronDown, ListFilter, ChefHat } from "lucide-react";
import { searchRecipes } from "../api/spoonacular";
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeCardSkeleton from "../components/recipe/RecipeCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const DIETS = ["Vegetarian", "Vegan", "Gluten Free", "Dairy Free", "Ketogenic", "Paleo", "Whole30"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer"];
const CUISINES = ["Italian", "Mexican", "Indian", "Chinese", "Mediterranean", "American", "French", "Japanese", "Thai", "Middle Eastern"];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [ingredientsMode, setIngredientsMode] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  
  // Filters State
  const [diets, setDiets] = useState([]);
  const [mealType, setMealType] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [maxTime, setMaxTime] = useState([120]);
  const [calories, setCalories] = useState([1000]);
  const [sortBy, setSortBy] = useState("popularity");

  // Results State
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchResults = useCallback(async (isLoadMore = false) => {
    setIsLoading(true);
    const params = {
      query: ingredientsMode ? "" : query,
      includeIngredients: ingredientsMode ? ingredients.join(",") : "",
      diet: diets.join(","),
      type: mealType,
      cuisine: cuisine !== "all" ? cuisine : "",
      maxReadyTime: maxTime[0],
      maxCalories: calories[0],
      sort: sortBy,
      number: 12,
      offset: isLoadMore ? offset + 12 : 0,
      addRecipeInformation: true,
      fillIngredients: true,
    };

    // Clean up empty params
    Object.keys(params).forEach(k => {
      if (!params[k] && params[k] !== 0) delete params[k];
    });

    try {
      const data = await searchRecipes(params);
      if (data) {
        if (isLoadMore) {
          setResults(prev => [...prev, ...data.results]);
          setOffset(prev => prev + 12);
        } else {
          setResults(data.results);
          setTotalResults(data.totalResults);
          setOffset(0);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query, ingredientsMode, ingredients, diets, mealType, cuisine, maxTime, calories, sortBy, offset]);

  // Initial fetch and fetch on filter reset/apply
  useEffect(() => {
    // Only fetch automatically if we have a query or if it's the first load
    const timeoutId = setTimeout(() => {
      fetchResults(false);
    }, 500); // debounce
    return () => clearTimeout(timeoutId);
  }, [query, ingredientsMode, ingredients, diets, mealType, cuisine, maxTime, calories, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    fetchResults(false);
  };

  const addIngredient = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
        setIngredients([...ingredients, ingredientInput.trim()]);
        setIngredientInput("");
      }
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const toggleDiet = (diet) => {
    setDiets(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const clearFilters = () => {
    setDiets([]);
    setMealType("");
    setCuisine("all");
    setMaxTime([120]);
    setCalories([1000]);
    setSortBy("popularity");
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary h-8 px-2 text-xs">
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["diet", "type", "time"]} className="w-full">
        <AccordionItem value="diet">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Dietary Needs</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {DIETS.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`diet-${diet}`} 
                    checked={diets.includes(diet)}
                    onCheckedChange={() => toggleDiet(diet)}
                  />
                  <label htmlFor={`diet-${diet}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {diet}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Meal Type</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={mealType} onValueChange={setMealType} className="space-y-3 pt-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="type-any" />
                <label htmlFor="type-any" className="text-sm">Any</label>
              </div>
              {MEAL_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`type-${type}`} />
                  <label htmlFor={`type-${type}`} className="text-sm">{type}</label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cuisine">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Cuisine</AccordionTrigger>
          <AccordionContent>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Cuisine</SelectItem>
                {CUISINES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="time">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Max Cook Time</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4 px-2">
              <Slider 
                value={maxTime} 
                onValueChange={setMaxTime} 
                max={120} 
                step={5} 
                className="[&>[role=slider]]:bg-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>0 mins</span>
                <span className="text-foreground">{maxTime[0]} mins</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="calories">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Max Calories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4 px-2">
              <Slider 
                value={calories} 
                onValueChange={setCalories} 
                max={2000} 
                step={50} 
                className="[&>[role=slider]]:bg-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>0</span>
                <span className="text-foreground">{calories[0]} kcal</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">Discover Recipes</h1>
        
        {/* Search Bar Area */}
        <div className="bg-card border border-border p-4 md:p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              {!ingredientsMode ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    type="text" 
                    placeholder="Search by recipe name, keyword..." 
                    className="w-full pl-10 h-12 text-base rounded-xl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9">
                    Search
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input 
                        type="text" 
                        placeholder="Type an ingredient and press Enter..." 
                        className="w-full pl-10 h-12 text-base rounded-xl"
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyDown={addIngredient}
                      />
                    </div>
                    <Button onClick={addIngredient} type="button" className="h-12 px-6 rounded-xl">
                      Add
                    </Button>
                  </div>
                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-xl border border-border">
                      {ingredients.map(ing => (
                        <Badge key={ing} className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-sm rounded-full">
                          {ing}
                          <button onClick={() => removeIngredient(ing)} className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 sm:items-start shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-xl bg-secondary/50 border-border">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="healthiness">Healthiness</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="calories">Calories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-secondary px-3 py-2 rounded-lg border border-border w-fit">
              <Checkbox 
                id="ingredients-mode" 
                checked={ingredientsMode}
                onCheckedChange={(checked) => {
                  setIngredientsMode(checked);
                  if (checked) setQuery("");
                }}
              />
              <label htmlFor="ingredients-mode" className="text-sm font-medium leading-none cursor-pointer">
                Search by Ingredients
              </label>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden ml-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <ListFilter className="w-4 h-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[350px] overflow-y-auto">
                  <SheetTitle className="sr-only">Filters</SheetTitle>
                  <div className="py-4">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-24 border border-border bg-card p-5 rounded-2xl shadow-sm">
          <FiltersContent />
        </div>

        {/* Results Area */}
        <div className="flex-1 w-full">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              {!isLoading && totalResults > 0 ? `Found ${totalResults} recipes` : ''}
            </p>
          </div>

          {!isLoading && results.length === 0 ? (
            <div className="text-center py-20 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/30">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No recipes found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any recipes matching your current filters and search terms. Try adjusting them.
              </p>
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <X className="w-4 h-4" /> Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
                
                {isLoading && Array(12).fill(0).map((_, i) => (
                  <RecipeCardSkeleton key={`skel-${i}`} />
                ))}
              </div>

              {!isLoading && results.length > 0 && results.length < totalResults && (
                <div className="mt-12 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => fetchResults(true)}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    Load More Results
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
