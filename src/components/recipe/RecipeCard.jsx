import { Link } from "react-router-dom";
import { Clock, Users, Flame, CalendarPlus, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import FavoriteButton from "./FavoriteButton";
import AddToPlannerDialog from "./AddToPlannerDialog";
import { useState } from "react";

export default function RecipeCard({ recipe, size = "default", showAddToPlanner = true }) {
  const [plannerOpen, setPlannerOpen] = useState(false);

  const id = recipe.id;
  const title = recipe.title;
  const image = recipe.image;
  const readyInMinutes = recipe.readyInMinutes;
  const servings = recipe.servings;
  
  const caloriesNutrient = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories');
  const calories = caloriesNutrient ? Math.round(caloriesNutrient.amount) : null;

  const dietTags = [];
  if (recipe.vegetarian && !recipe.vegan) dietTags.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-800 border-green-200' });
  if (recipe.vegan) dietTags.push({ label: 'Vegan', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' });
  if (recipe.glutenFree) dietTags.push({ label: 'Gluten-Free', color: 'bg-blue-100 text-blue-800 border-blue-200' });
  if (recipe.dairyFree) dietTags.push({ label: 'Dairy-Free', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' });

  const isCompact = size === 'compact';

  return (
    <>
      <Link to={`/recipe/${id}`} className="block group h-full">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border bg-card">
          {/* Image Header */}
          <div className={`relative w-full ${isCompact ? 'aspect-video' : 'aspect-4/3'} overflow-hidden bg-secondary flex items-center justify-center`}>
            {image ? (
              <img
                src={image}
                alt={title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
            )}
            
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton recipe={recipe} className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white" />
            </div>
          </div>

          <CardContent className={`flex-1 flex flex-col ${isCompact ? 'p-3' : 'p-4 md:p-5'}`}>
            <h3 className={`font-serif font-bold text-foreground line-clamp-2 mb-2 ${isCompact ? 'text-lg' : 'text-xl'}`}>
              {title}
            </h3>

            {/* Meta tags inline */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3 mt-auto">
              {readyInMinutes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{readyInMinutes}m</span>
                </div>
              )}
              {servings > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{servings}</span>
                </div>
              )}
              {calories && (
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-primary shrink-0" />
                  <span>{calories} kcal</span>
                </div>
              )}
            </div>

            {/* Diet tags */}
            {!isCompact && dietTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {dietTags.slice(0, 3).map(tag => (
                  <Badge 
                    key={tag.label} 
                    variant="outline" 
                    className={`font-normal text-xs px-1.5 py-0 border ${tag.color}`}
                  >
                    {tag.label}
                  </Badge>
                ))}
                {dietTags.length > 3 && (
                  <Badge variant="outline" className="font-normal text-xs px-1.5 py-0 text-muted-foreground">
                    +{dietTags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          {showAddToPlanner && (
            <CardFooter className={`border-t border-border bg-secondary/20 justify-end ${isCompact ? 'p-2' : 'p-3'}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-primary hover:text-primary hover:bg-primary/10 gap-2 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlannerOpen(true);
                }}
              >
                <CalendarPlus className="w-4 h-4" />
                Add to Plan
              </Button>
            </CardFooter>
          )}
        </Card>
      </Link>

      <AddToPlannerDialog 
        recipe={recipe} 
        open={plannerOpen} 
        onOpenChange={setPlannerOpen} 
      />
    </>
  );
}
