import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getISOWeek, getYear } from "date-fns";
import { toast } from "sonner";

const MealPlanContext = createContext();

// Format: "YYYY-WW" e.g. "2026-11"
export const getCurrentWeekKey = (date = new Date()) => {
  return `${getYear(date)}-${getISOWeek(date).toString().padStart(2, "0")}`;
};

export function MealPlanProvider({ children }) {
  // We store the entire meal plan history in one object to simplify tracking.
  // Keys: "YYYY-WW" -> Values: { day: { mealType: record } }
  // Example: "2026-11" -> { "Monday": { "Breakfast": recipeObj, "Dinner": recipeObj } }
  const [mealPlans, setMealPlans] = useLocalStorage("recipe-nest-meal-plans", {});

  const getWeekPlan = useCallback((weekKey) => {
    return mealPlans[weekKey] || {};
  }, [mealPlans]);

  const addToMealPlan = useCallback((weekKey, day, mealType, recipe) => {
    setMealPlans((prev) => {
      const weekData = prev[weekKey] || {};
      const dayData = weekData[day] || {};
      
      const newPlan = {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: {
            ...dayData,
            [mealType]: recipe
          }
        }
      };
      toast.success(`Added to ${day} ${mealType}`);
      return newPlan;
    });
  }, [setMealPlans]);

  const removeFromMealPlan = useCallback((weekKey, day, mealType) => {
    setMealPlans((prev) => {
      const weekData = prev[weekKey];
      if (!weekData || !weekData[day] || !weekData[day][mealType]) return prev;

      const newDayData = { ...weekData[day] };
      delete newDayData[mealType];

      toast.success(`Removed from ${day} ${mealType}`);

      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [day]: newDayData
        }
      };
    });
  }, [setMealPlans]);

  // Handle Dnd reorders within the planner (moving a recipe from one slot to another)
  const moveMeal = useCallback((weekKey, sourceDay, sourceMealType, targetDay, targetMealType) => {
    setMealPlans((prev) => {
      const weekData = prev[weekKey] || {};
      const recipeToMove = weekData[sourceDay]?.[sourceMealType];

      if (!recipeToMove) return prev;

      // Also remove it from source
      const newSourceDayData = { ...(weekData[sourceDay] || {}) };
      delete newSourceDayData[sourceMealType];

      const newTargetDayData = { ...(weekData[targetDay] || {}) };
      newTargetDayData[targetMealType] = recipeToMove;

      return {
        ...prev,
        [weekKey]: {
          ...weekData,
          [sourceDay]: newSourceDayData,
          [targetDay]: newTargetDayData
        }
      };
    });
  }, [setMealPlans]);

  return (
    <MealPlanContext.Provider
      value={{
        mealPlans,
        getWeekPlan,
        addToMealPlan,
        removeFromMealPlan,
        moveMeal
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error("useMealPlan must be used within a MealPlanProvider");
  }
  return context;
}
