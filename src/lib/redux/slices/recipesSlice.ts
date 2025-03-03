import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Recipe } from "../../../types/recipe";
import { supabase } from "../../supabase/client";

interface RecipesState {
  recipes: Recipe[];
  featuredRecipes: Recipe[];
  userRecipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecipesState = {
  recipes: [],
  featuredRecipes: [],
  userRecipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
};

// Async thunks for recipe operations
export const fetchRecipes = createAsyncThunk(
  "recipes/fetchRecipes",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("isPublic", true)
        .order("createdAt", { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as Recipe[];
    } catch (error) {
      return rejectWithValue("Failed to fetch recipes");
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  "recipes/fetchRecipeById",
  async (recipeId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as Recipe;
    } catch (error) {
      return rejectWithValue("Failed to fetch recipe");
    }
  }
);

export const fetchUserRecipes = createAsyncThunk(
  "recipes/fetchUserRecipes",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("authorId", userId)
        .order("createdAt", { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as Recipe[];
    } catch (error) {
      return rejectWithValue("Failed to fetch user recipes");
    }
  }
);

export const createRecipe = createAsyncThunk(
  "recipes/createRecipe",
  async (
    recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "likes">,
    { rejectWithValue }
  ) => {
    try {
      const newRecipe = {
        ...recipe,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
      };

      const { data, error } = await supabase
        .from("recipes")
        .insert(newRecipe)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as Recipe;
    } catch (error) {
      return rejectWithValue("Failed to create recipe");
    }
  }
);

export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async (
    { id, recipe }: { id: string; recipe: Partial<Recipe> },
    { rejectWithValue }
  ) => {
    try {
      const updatedRecipe = {
        ...recipe,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("recipes")
        .update(updatedRecipe)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as Recipe;
    } catch (error) {
      return rejectWithValue("Failed to update recipe");
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (recipeId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return recipeId;
    } catch (error) {
      return rejectWithValue("Failed to delete recipe");
    }
  }
);

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setCurrentRecipe: (state, action: PayloadAction<Recipe>) => {
      state.currentRecipe = action.payload;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
        state.featuredRecipes = action.payload.slice(0, 5); // First 5 recipes as featured
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch recipe by ID
      .addCase(fetchRecipeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecipe = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user recipes
      .addCase(fetchUserRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRecipes = action.payload;
      })
      .addCase(fetchUserRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create recipe
      .addCase(createRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRecipes.unshift(action.payload);
        state.currentRecipe = action.payload;
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update recipe
      .addCase(updateRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecipe = action.payload;

        // Update in recipes list
        const index = state.recipes.findIndex(
          (recipe) => recipe.id === action.payload.id
        );
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }

        // Update in user recipes list
        const userIndex = state.userRecipes.findIndex(
          (recipe) => recipe.id === action.payload.id
        );
        if (userIndex !== -1) {
          state.userRecipes[userIndex] = action.payload;
        }
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete recipe
      .addCase(deleteRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = state.recipes.filter(
          (recipe) => recipe.id !== action.payload
        );
        state.userRecipes = state.userRecipes.filter(
          (recipe) => recipe.id !== action.payload
        );
        if (state.currentRecipe?.id === action.payload) {
          state.currentRecipe = null;
        }
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentRecipe, clearCurrentRecipe } = recipesSlice.actions;
export default recipesSlice.reducer;
