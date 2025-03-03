export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
  timers?: number[]; // in minutes
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition?: NutritionInfo;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isPublic: boolean;
}
