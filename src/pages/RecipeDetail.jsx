import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Clock, Flame, Users, Star, CheckCircle, Plus, Minus, Check, ArrowLeft, ShareIcon } from "lucide-react";
import { getRecipeById, getSimilarRecipes } from "../api/spoonacular";
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeCardSkeleton from "../components/recipe/RecipeCardSkeleton";
import FavoriteButton from "../components/recipe/FavoriteButton";
import AddToPlannerDialog from "../components/recipe/AddToPlannerDialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [servings, setServings] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useLocalStorage(`checked-ingredients-${id}`, {});
  const [checkedSteps, setCheckedSteps] = useLocalStorage(`checked-steps-${id}`, {});
  const [plannerOpen, setPlannerOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getRecipeById(id);
        const similarData = await getSimilarRecipes(id);
        if (data) {
          setRecipe(data);
          setServings(data.servings || 1);
        }
        if (similarData) setSimilar(similarData);
      } catch (error) {
        console.error("Failed to fetch recipe details", error);
        toast.error("Could not load recipe details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="w-full h-[400px] rounded-2xl" />
        <div className="flex gap-8">
          <div className="w-1/3 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full mt-8" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) return <div className="text-center py-20 text-xl font-serif">Recipe not found.</div>;

  const originalServings = recipe.servings || 1;
  const ratio = servings / originalServings;

  const getNutrient = (name) => {
    const nut = recipe.nutrition?.nutrients?.find(n => n.name === name);
    return nut ? `${Math.round(nut.amount)} ${nut.unit}` : "-";
  };

  // Convert HTML description carefully (Spoonacular summary usually contains bold and links)
  const sanitizeSummary = (html) => ({ __html: html });

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700 pb-16">
      
      {/* Navigation */}
      <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back to results
      </Button>

      {/* Hero Section */}
      <section className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[21/9] bg-secondary border border-border">
          {recipe.image && (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-10">
            <div className="text-white space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {recipe.cuisines?.slice(0, 2).map(c => 
                  <Badge key={c} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-none">{c}</Badge>
                )}
                {recipe.dishTypes?.slice(0, 2).map(d => 
                  <Badge key={d} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-none capitalize">{d}</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white drop-shadow-md">
                {recipe.title}
              </h1>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <FavoriteButton recipe={recipe} className="bg-white text-foreground shadow-md hover:bg-gray-100" />
            <Button size="icon" variant="secondary" className="rounded-full shadow-md bg-white hover:bg-gray-100" onClick={handleShare}>
              <ShareIcon className="w-4 h-4 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Action Bar & Meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-4 md:px-8 rounded-2xl shadow-sm">
          <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
            {recipe.readyInMinutes && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full"><Clock className="w-5 h-5 text-primary" /></div>
                <div className="flex flex-col"><span className="text-foreground text-base">{recipe.readyInMinutes}</span><span className="text-xs">Minutes</span></div>
              </div>
            )}
            {recipe.healthScore > 0 && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full"><Star className="w-5 h-5 text-green-600" /></div>
                <div className="flex flex-col"><span className="text-foreground text-base">{recipe.healthScore}</span><span className="text-xs">Health Score</span></div>
              </div>
            )}
            {recipe.nutrition && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-full"><Flame className="w-5 h-5 text-orange-500" /></div>
                <div className="flex flex-col"><span className="text-foreground text-base">{getNutrient('Calories')}</span><span className="text-xs">per serving</span></div>
              </div>
            )}
          </div>

          <Button size="lg" className="rounded-xl px-8 shadow-md hover:shadow-lg transition-shadow" onClick={() => setPlannerOpen(true)}>
            Add to Meal Plan
          </Button>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
        
        {/* Left Column (Sticky Ingredients) */}
        <div className="md:col-span-4 lg:col-span-4 space-y-8 md:sticky md:top-24">
          
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 bg-secondary/50 border-b border-border flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl">Ingredients</h3>
              <div className="flex items-center bg-card rounded-lg border border-border shadow-sm">
                <button 
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="p-1 hover:bg-secondary rounded-l-md transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 font-medium text-sm flex items-center gap-1 min-w-[3rem] justify-center">
                  {servings} <Users className="w-3 h-3 text-muted-foreground" />
                </div>
                <button 
                  onClick={() => setServings(servings + 1)}
                  className="p-1 hover:bg-secondary rounded-r-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <ul className="p-5 space-y-3">
              {recipe.extendedIngredients?.map((ing, idx) => {
                const amount = Number((ing.amount * ratio).toFixed(2));
                const checked = checkedIngredients[idx];
                return (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => toggleIngredient(idx)}
                  >
                    <div className={`mt-0.5 shrink-0 rounded-full border flex items-center justify-center transition-colors w-5 h-5 ${checked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40 text-transparent group-hover:border-primary'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <div className={checked ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}>
                      <span className="font-semibold">{amount} {ing.unit}</span> {ing.nameClean || ing.name}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Nutrition Panel */}
          {recipe.nutrition && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-serif font-bold text-xl">Nutrition</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Protein", val: getNutrient('Protein') },
                  { name: "Carbs", val: getNutrient('Carbohydrates') },
                  { name: "Fat", val: getNutrient('Fat') },
                  { name: "Fiber", val: getNutrient('Fiber') },
                  { name: "Sugar", val: getNutrient('Sugar') },
                  { name: "Sodium", val: getNutrient('Sodium') },
                ].map(n => (
                  <div key={n.name} className="flex flex-col border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider">{n.name}</span>
                    <span className="font-medium text-lg">{n.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Instructions) */}
        <div className="md:col-span-8 lg:col-span-8 space-y-12">
          
          <div 
            className="prose prose-stone max-w-none text-muted-foreground leading-relaxed md:text-lg"
            dangerouslySetInnerHTML={sanitizeSummary(recipe.summary)}
          />

          <Separator className="my-8" />
          
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Instructions</h2>
            
            {!recipe.analyzedInstructions?.length ? (
              <p className="text-muted-foreground italic">No instructions provided.</p>
            ) : (
              <div className="space-y-6">
                {recipe.analyzedInstructions[0].steps.map((step, idx) => {
                  const checked = checkedSteps[idx];
                  return (
                    <div 
                      key={idx} 
                      className={`relative pl-8 md:pl-12 py-2 transition-opacity duration-300 ${checked ? 'opacity-50' : 'opacity-100'}`}
                    >
                      {/* Left border indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-colors ${checked ? 'bg-muted' : 'bg-primary'}`} />
                      
                      <div className="flex gap-4">
                        <div className="font-serif text-4xl md:text-5xl font-bold text-muted-foreground/20 leading-none shrink-0 -mt-2">
                          {idx + 1}
                        </div>
                        
                        <div className="space-y-3 flex-1">
                          <p className="text-lg text-foreground leading-relaxed">
                            {step.step}
                          </p>
                          
                          <button 
                            onClick={() => toggleStep(idx)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${checked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            <CheckCircle className={`w-5 h-5 ${checked ? 'fill-primary/20 text-primary' : ''}`} />
                            {checked ? 'Completed' : 'Mark as done'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-16" />

      {/* Similar Recipes */}
      {similar.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similar.map(sim => (
              <RecipeCard key={sim.id} recipe={{ ...sim, image: `https://spoonacular.com/recipeImages/${sim.id}-556x370.${sim.imageType}` }} size="compact" showAddToPlanner={false} />
            ))}
          </div>
        </section>
      )}

      {/* Dialog for Meal Planner */}
      <AddToPlannerDialog open={plannerOpen} onOpenChange={setPlannerOpen} recipe={recipe} />
    </div>
  );
}
