import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MealPlan, PlannedMeal } from "../../../types/meal-planning";
import { supabase } from "../../supabase/client";

interface MealPlanState {
  mealPlans: MealPlan[];
  currentMealPlan: MealPlan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MealPlanState = {
  mealPlans: [],
  currentMealPlan: null,
  isLoading: false,
  error: null,
};

// Async thunks for meal plan operations
export const fetchUserMealPlans = createAsyncThunk(
  "mealPlan/fetchUserMealPlans",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("userId", userId)
        .order("startDate", { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as MealPlan[];
    } catch (error) {
      return rejectWithValue("Failed to fetch meal plans");
    }
  }
);

export const fetchMealPlanById = createAsyncThunk(
  "mealPlan/fetchMealPlanById",
  async (mealPlanId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select(
          `
          *,
          meals:planned_meals(*)
        `
        )
        .eq("id", mealPlanId)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as MealPlan;
    } catch (error) {
      return rejectWithValue("Failed to fetch meal plan");
    }
  }
);

export const createMealPlan = createAsyncThunk(
  "mealPlan/createMealPlan",
  async (
    mealPlan: Omit<MealPlan, "id" | "createdAt" | "updatedAt" | "meals">,
    { rejectWithValue }
  ) => {
    try {
      const newMealPlan = {
        ...mealPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("meal_plans")
        .insert(newMealPlan)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return { ...data, meals: [] } as MealPlan;
    } catch (error) {
      return rejectWithValue("Failed to create meal plan");
    }
  }
);

export const updateMealPlan = createAsyncThunk(
  "mealPlan/updateMealPlan",
  async (
    { id, mealPlan }: { id: string; mealPlan: Partial<MealPlan> },
    { rejectWithValue }
  ) => {
    try {
      const updatedMealPlan = {
        ...mealPlan,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("meal_plans")
        .update(updatedMealPlan)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as MealPlan;
    } catch (error) {
      return rejectWithValue("Failed to update meal plan");
    }
  }
);

export const deleteMealPlan = createAsyncThunk(
  "mealPlan/deleteMealPlan",
  async (mealPlanId: string, { rejectWithValue }) => {
    try {
      // First delete all planned meals associated with this meal plan
      const { error: mealsError } = await supabase
        .from("planned_meals")
        .delete()
        .eq("mealPlanId", mealPlanId);

      if (mealsError) {
        return rejectWithValue(mealsError.message);
      }

      // Then delete the meal plan itself
      const { error } = await supabase
        .from("meal_plans")
        .delete()
        .eq("id", mealPlanId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return mealPlanId;
    } catch (error) {
      return rejectWithValue("Failed to delete meal plan");
    }
  }
);

export const addPlannedMeal = createAsyncThunk(
  "mealPlan/addPlannedMeal",
  async (plannedMeal: Omit<PlannedMeal, "id">, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("planned_meals")
        .insert(plannedMeal)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as PlannedMeal;
    } catch (error) {
      return rejectWithValue("Failed to add planned meal");
    }
  }
);

export const updatePlannedMeal = createAsyncThunk(
  "mealPlan/updatePlannedMeal",
  async (
    { id, plannedMeal }: { id: string; plannedMeal: Partial<PlannedMeal> },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from("planned_meals")
        .update(plannedMeal)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as PlannedMeal;
    } catch (error) {
      return rejectWithValue("Failed to update planned meal");
    }
  }
);

export const deletePlannedMeal = createAsyncThunk(
  "mealPlan/deletePlannedMeal",
  async (plannedMealId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("planned_meals")
        .delete()
        .eq("id", plannedMealId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return plannedMealId;
    } catch (error) {
      return rejectWithValue("Failed to delete planned meal");
    }
  }
);

const mealPlanSlice = createSlice({
  name: "mealPlan",
  initialState,
  reducers: {
    setCurrentMealPlan: (state, action: PayloadAction<MealPlan>) => {
      state.currentMealPlan = action.payload;
    },
    clearCurrentMealPlan: (state) => {
      state.currentMealPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user meal plans
      .addCase(fetchUserMealPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserMealPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mealPlans = action.payload;
      })
      .addCase(fetchUserMealPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch meal plan by ID
      .addCase(fetchMealPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMealPlan = action.payload;
      })
      .addCase(fetchMealPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create meal plan
      .addCase(createMealPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMealPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mealPlans.unshift(action.payload);
        state.currentMealPlan = action.payload;
      })
      .addCase(createMealPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update meal plan
      .addCase(updateMealPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMealPlan.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update in meal plans list
        const index = state.mealPlans.findIndex(
          (mp) => mp.id === action.payload.id
        );
        if (index !== -1) {
          // Preserve the meals array if it exists in the current state
          const meals = state.mealPlans[index].meals || [];
          state.mealPlans[index] = { ...action.payload, meals };
        }

        // Update current meal plan if it's the same one
        if (state.currentMealPlan?.id === action.payload.id) {
          // Preserve the meals array if it exists in the current state
          const meals = state.currentMealPlan.meals || [];
          state.currentMealPlan = { ...action.payload, meals };
        }
      })
      .addCase(updateMealPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete meal plan
      .addCase(deleteMealPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMealPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mealPlans = state.mealPlans.filter(
          (mp) => mp.id !== action.payload
        );
        if (state.currentMealPlan?.id === action.payload) {
          state.currentMealPlan = null;
        }
      })
      .addCase(deleteMealPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add planned meal
      .addCase(addPlannedMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPlannedMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        if (
          state.currentMealPlan &&
          action.payload.mealPlanId === state.currentMealPlan.id
        ) {
          state.currentMealPlan.meals = [
            ...(state.currentMealPlan.meals || []),
            action.payload,
          ];
        }
      })
      .addCase(addPlannedMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update planned meal
      .addCase(updatePlannedMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePlannedMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentMealPlan) {
          const mealIndex = state.currentMealPlan.meals.findIndex(
            (meal) => meal.id === action.payload.id
          );
          if (mealIndex !== -1) {
            state.currentMealPlan.meals[mealIndex] = action.payload;
          }
        }
      })
      .addCase(updatePlannedMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete planned meal
      .addCase(deletePlannedMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePlannedMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentMealPlan) {
          state.currentMealPlan.meals = state.currentMealPlan.meals.filter(
            (meal) => meal.id !== action.payload
          );
        }
      })
      .addCase(deletePlannedMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentMealPlan, clearCurrentMealPlan } =
  mealPlanSlice.actions;
export default mealPlanSlice.reducer;
