import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMealPlan, getCurrentWeekKey } from "../../context/MealPlanContext";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"];

export default function AddToPlannerDialog({ recipe, open, onOpenChange }) {
  const { addToMealPlan } = useMealPlan();
  
  // Default forms to today's day (or next available) and Dinner
  const todayIndex = new Date().getDay(); // 0 is Sunday
  const defaultDay = todayIndex === 0 ? "Sunday" : DAYS_OF_WEEK[todayIndex - 1]; // map JS getDay to our array
  
  const [day, setDay] = useState(defaultDay);
  const [mealType, setMealType] = useState("Dinner");

  const handleSave = () => {
    if (!day || !mealType) return;
    
    const weekKey = getCurrentWeekKey();
    addToMealPlan(weekKey, day, mealType, recipe);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-foreground">Add to Meal Plan</DialogTitle>
          <DialogDescription>
            Schedule <strong className="font-semibold text-foreground">{recipe?.title}</strong> for this week.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="day" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Day of Week
            </label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger id="day">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="mealType" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Meal Type
            </label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger id="mealType">
                <SelectValue placeholder="Select a meal" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            Save to Planner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
