import { Recipe } from "./recipe";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: PlannedMeal[];
  createdAt: string;
  updatedAt: string;
}

export interface PlannedMeal {
  id: string;
  recipeId: string;
  recipe?: Recipe;
  date: string;
  mealType: MealType;
  servings: number;
  notes?: string;
}

export interface GroceryList {
  id: string;
  userId: string;
  mealPlanId: string;
  name: string;
  items: GroceryItem[];
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isChecked: boolean;
  notes?: string;
}
