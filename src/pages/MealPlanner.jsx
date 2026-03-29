import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { format, addWeeks, subWeeks, startOfISOWeek, endOfISOWeek, getISOWeek, getYear } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2, Search, Zap } from "lucide-react";
import { useMealPlan } from "../context/MealPlanContext";
import { useFavorites } from "../context/FavoritesContext";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { searchRecipes } from "../api/spoonacular";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"];

export default function MealPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { mealPlans, getWeekPlan, removeFromMealPlan, moveMeal, addToMealPlan } = useMealPlan();
  const { favorites } = useFavorites();
  const [activeDragItem, setActiveDragItem] = useState(null);
  
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarResults, setSidebarResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const weekStart = startOfISOWeek(currentDate);
  const weekEnd = endOfISOWeek(currentDate);
  const weekKey = `${getYear(currentDate)}-${getISOWeek(currentDate).toString().padStart(2, "0")}`;
  const weekPlan = getWeekPlan(weekKey);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const todayWeek = () => setCurrentDate(new Date());

  const handleSidebarSearch = async (e) => {
    e.preventDefault();
    if (!sidebarSearch.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchRecipes({ query: sidebarSearch, number: 5 });
      if (data?.results) setSidebarResults(data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const sourceData = active.data.current;
    const targetData = over.data.current;

    if (sourceData.type === "sidebar-recipe") {
      addToMealPlan(weekKey, targetData.day, targetData.mealType, sourceData.recipe);
    } else if (sourceData.type === "planner-meal") {
      if (sourceData.day === targetData.day && sourceData.mealType === targetData.mealType) return;
      moveMeal(weekKey, sourceData.day, sourceData.mealType, targetData.day, targetData.mealType);
    }
  };
  const totalMacros = useMemo(() => {
    let cal = 0, pro = 0, fat = 0, carb = 0;
    let missingMeals = 7 * 3; 

    Object.values(weekPlan).forEach(dayObj => {
      Object.values(dayObj).forEach(recipe => {
        missingMeals--;
        if (recipe.nutrition?.nutrients) {
          const findN = (name) => recipe.nutrition.nutrients.find(n => n.name === name)?.amount || 0;
          cal += findN('Calories');
          pro += findN('Protein');
          fat += findN('Fat');
          carb += findN('Carbohydrates');
        }
      });
    });

    return { cal: Math.round(cal), pro: Math.round(pro), fat: Math.round(fat), carb: Math.round(carb), missingMeals };
  }, [weekPlan]);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="animate-in fade-in duration-500 pb-12 flex flex-col lg:flex-row gap-8 items-start h-[calc(100vh-8rem)]">
        
        {/* Main Calendar Area */}
        <div className="flex-1 w-full space-y-6 overflow-y-auto pr-4 h-full custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background z-10 py-4 pb-6 border-b border-border">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Meal Planner</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                <CalendarIcon className="w-4 h-4" />
                {format(weekStart, "MMM d")} — {format(weekEnd, "MMM d, yyyy")}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl">
              <Button variant="ghost" size="icon" onClick={prevWeek} className="rounded-lg hover:bg-white"><ChevronLeft className="w-5 h-5" /></Button>
              <Button variant="ghost" onClick={todayWeek} className="rounded-lg hover:bg-white font-medium px-4">Today</Button>
              <Button variant="ghost" size="icon" onClick={nextWeek} className="rounded-lg hover:bg-white"><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-200 overflow-x-auto pb-6">
            {/* Headers */}
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center font-serif font-bold text-foreground py-2 border-b-2 border-primary/20 bg-secondary/30 rounded-t-xl">
                {day.substring(0, 3)}
              </div>
            ))}

            {/* Grid rows */}
            {MEAL_TYPES.map(mealType => (
              <div key={mealType} className="col-span-7 contents group">
                {DAYS_OF_WEEK.map(day => {
                  const recipe = weekPlan[day]?.[mealType];
                  return (
                    <DroppableSlot 
                      key={`${day}-${mealType}`} 
                      day={day} 
                      mealType={mealType} 
                      recipe={recipe} 
                      weekKey={weekKey}
                      onRemove={() => removeFromMealPlan(weekKey, day, mealType)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mt-8">
            <h3 className="font-serif font-bold text-xl mb-6">Weekly Nutrition Estimate</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-orange-600 font-bold text-2xl">{totalMacros.cal}</p>
                <p className="text-xs font-semibold text-orange-800 uppercase tracking-widest mt-1">Calories</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-blue-600 font-bold text-2xl">{totalMacros.pro}g</p>
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-widest mt-1">Protein</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-green-600 font-bold text-2xl">{totalMacros.fat}g</p>
                <p className="text-xs font-semibold text-green-800 uppercase tracking-widest mt-1">Fat</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-purple-600 font-bold text-2xl">{totalMacros.carb}g</p>
                <p className="text-xs font-semibold text-purple-800 uppercase tracking-widest mt-1">Carbs</p>
              </div>
            </div>
            
            {totalMacros.missingMeals > 0 && (
              <p className="text-muted-foreground text-center mt-6 text-sm font-medium bg-secondary/50 p-3 rounded-lg">
                <Zap className="w-4 h-4 inline-block text-primary mr-2" />
                You have {totalMacros.missingMeals} empty slots this week. Drag recipes to plan them!
              </p>
            )}
          </div>

        </div>

        {/* Sidebar Recipe Picker */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col h-full sticky top-4 border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-serif font-bold text-lg mb-4">Recipe Box</h3>
            <form onSubmit={handleSidebarSearch} className="flex gap-2">
              <Input 
                placeholder="Search to add..." 
                className="h-9 text-sm rounded-lg"
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
              />
              <Button type="submit" size="sm" className="h-9 px-3 rounded-lg" disabled={isSearching}>
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/50">
            {sidebarResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search Results</p>
                {sidebarResults.map(r => <DraggableSidebarCard key={`search-${r.id}`} recipe={r} />)}
              </div>
            ) : null}

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Favorites</p>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Your favorites list is empty.</p>
              ) : (
                favorites.map(r => <DraggableSidebarCard key={`fav-${r.id}`} recipe={r} />)
              )}
            </div>
          </div>
        </div>

      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? (
          <div className="w-48 bg-white border-2 border-primary rounded-xl shadow-2xl p-2 z-50 transform rotate-2">
            <img 
              src={activeDragItem.recipe.image} 
              className="w-full h-24 object-cover rounded-lg mb-2" 
              alt=""
            />
            <p className="text-sm font-bold truncate px-1">{activeDragItem.recipe.title}</p>
          </div>
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}

function DroppableSlot({ day, mealType, recipe, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${day}-${mealType}`,
    data: { type: "slot", day, mealType }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`relative rounded-xl border-2 transition-all p-1.5 h-32 flex flex-col items-center justify-center 
        ${isOver ? 'border-primary bg-primary/10 shadow-inner' : 'border-dashed border-border/70 hover:border-border bg-card/50'}`}
    >
      <div className="absolute top-1 left-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider z-10 pointer-events-none">
        {mealType.substring(0, 3)}
      </div>

      {!recipe ? (
        <div className="text-muted-foreground/40 flex flex-col items-center gap-1 opacity-50">
          <Plus className="w-6 h-6" />
        </div>
      ) : (
        <DraggablePlannerCard 
          day={day} 
          mealType={mealType} 
          recipe={recipe} 
          onRemove={onRemove} 
        />
      )}
    </div>
  );
}

function DraggableSidebarCard({ recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${recipe.id}`,
    data: { type: "sidebar-recipe", recipe }
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`flex items-center gap-3 p-2 bg-card border border-border rounded-xl cursor-grab hover:border-primary/50 transition-colors shadow-sm
        ${isDragging ? 'opacity-40 scale-95 border-primary' : ''}`}
    >
      <img src={recipe.image || "https://placehold.co/100"} alt="" className="w-12 h-12 object-cover rounded-lg shadow-sm" />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold truncate text-foreground">{recipe.title}</p>
        <p className="text-xs text-muted-foreground">{recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : 'Quick meal'}</p>
      </div>
    </div>
  );
}

function DraggablePlannerCard({ day, mealType, recipe, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `planner-${day}-${mealType}`,
    data: { type: "planner-meal", day, mealType, recipe }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`w-full h-full relative group rounded-lg overflow-hidden cursor-grab shadow-sm
        ${isDragging ? 'opacity-0' : 'opacity-100'}`}
    >
      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
        <Link 
          to={`/recipe/${recipe.id}`} 
          className="text-xs font-bold text-white line-clamp-2 hover:underline leading-tight"
          onPointerDown={e => e.stopPropagation()}
        >
          {recipe.title}
        </Link>
      </div>
      
      {/* Overlay Drag handle & Remove btn */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div 
          className="p-2 bg-white/20 backdrop-blur-sm rounded-full cursor-grab hover:bg-white/40 text-white"
          {...listeners} 
          {...attributes}
        >
          <CalendarIcon className="w-4 h-4" />
        </div>
        <button 
          onPointerDown={e => e.stopPropagation()} 
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          className="p-2 bg-destructive/80 backdrop-blur-sm rounded-full text-white hover:bg-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
