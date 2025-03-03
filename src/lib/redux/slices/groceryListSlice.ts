import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { GroceryList, GroceryItem } from "../../../types/meal-planning";
import { supabase } from "../../supabase/client";

interface GroceryListState {
  groceryLists: GroceryList[];
  currentGroceryList: GroceryList | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroceryListState = {
  groceryLists: [],
  currentGroceryList: null,
  isLoading: false,
  error: null,
};

// Async thunks for grocery list operations
export const fetchUserGroceryLists = createAsyncThunk(
  "groceryList/fetchUserGroceryLists",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as GroceryList[];
    } catch (error) {
      return rejectWithValue("Failed to fetch grocery lists");
    }
  }
);

export const fetchGroceryListById = createAsyncThunk(
  "groceryList/fetchGroceryListById",
  async (groceryListId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("grocery_lists")
        .select(
          `
          *,
          items:grocery_items(*)
        `
        )
        .eq("id", groceryListId)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as GroceryList;
    } catch (error) {
      return rejectWithValue("Failed to fetch grocery list");
    }
  }
);

export const createGroceryList = createAsyncThunk(
  "groceryList/createGroceryList",
  async (
    groceryList: Omit<GroceryList, "id" | "createdAt" | "updatedAt" | "items">,
    { rejectWithValue }
  ) => {
    try {
      const newGroceryList = {
        ...groceryList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false,
      };

      const { data, error } = await supabase
        .from("grocery_lists")
        .insert(newGroceryList)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return { ...data, items: [] } as GroceryList;
    } catch (error) {
      return rejectWithValue("Failed to create grocery list");
    }
  }
);

export const updateGroceryList = createAsyncThunk(
  "groceryList/updateGroceryList",
  async (
    { id, groceryList }: { id: string; groceryList: Partial<GroceryList> },
    { rejectWithValue }
  ) => {
    try {
      const updatedGroceryList = {
        ...groceryList,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("grocery_lists")
        .update(updatedGroceryList)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as GroceryList;
    } catch (error) {
      return rejectWithValue("Failed to update grocery list");
    }
  }
);

export const deleteGroceryList = createAsyncThunk(
  "groceryList/deleteGroceryList",
  async (groceryListId: string, { rejectWithValue }) => {
    try {
      // First delete all grocery items associated with this list
      const { error: itemsError } = await supabase
        .from("grocery_items")
        .delete()
        .eq("groceryListId", groceryListId);

      if (itemsError) {
        return rejectWithValue(itemsError.message);
      }

      // Then delete the grocery list itself
      const { error } = await supabase
        .from("grocery_lists")
        .delete()
        .eq("id", groceryListId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return groceryListId;
    } catch (error) {
      return rejectWithValue("Failed to delete grocery list");
    }
  }
);

export const addGroceryItem = createAsyncThunk(
  "groceryList/addGroceryItem",
  async (groceryItem: Omit<GroceryItem, "id">, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("grocery_items")
        .insert(groceryItem)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as GroceryItem;
    } catch (error) {
      return rejectWithValue("Failed to add grocery item");
    }
  }
);

export const updateGroceryItem = createAsyncThunk(
  "groceryList/updateGroceryItem",
  async (
    { id, groceryItem }: { id: string; groceryItem: Partial<GroceryItem> },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from("grocery_items")
        .update(groceryItem)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as GroceryItem;
    } catch (error) {
      return rejectWithValue("Failed to update grocery item");
    }
  }
);

export const deleteGroceryItem = createAsyncThunk(
  "groceryList/deleteGroceryItem",
  async (groceryItemId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("grocery_items")
        .delete()
        .eq("id", groceryItemId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return groceryItemId;
    } catch (error) {
      return rejectWithValue("Failed to delete grocery item");
    }
  }
);

export const generateGroceryListFromMealPlan = createAsyncThunk(
  "groceryList/generateFromMealPlan",
  async (
    {
      mealPlanId,
      userId,
      name,
    }: { mealPlanId: string; userId: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      // First, create a new grocery list
      const newGroceryList = {
        userId,
        mealPlanId,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false,
      };

      const { data: groceryListData, error: groceryListError } = await supabase
        .from("grocery_lists")
        .insert(newGroceryList)
        .select()
        .single();

      if (groceryListError) {
        return rejectWithValue(groceryListError.message);
      }

      // Fetch the meal plan with all planned meals and their recipes
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from("meal_plans")
        .select(
          `
          *,
          meals:planned_meals(
            *,
            recipe:recipes(
              *,
              ingredients:recipe_ingredients(*)
            )
          )
        `
        )
        .eq("id", mealPlanId)
        .single();

      if (mealPlanError) {
        return rejectWithValue(mealPlanError.message);
      }

      // Extract all ingredients from the recipes in the meal plan
      const ingredients: Record<string, GroceryItem> = {};

      mealPlanData.meals.forEach((meal: any) => {
        if (meal.recipe && meal.recipe.ingredients) {
          meal.recipe.ingredients.forEach((ingredient: any) => {
            const key = `${ingredient.name}-${ingredient.unit}`;

            if (ingredients[key]) {
              // If ingredient already exists, update quantity
              ingredients[key].quantity +=
                ingredient.quantity * (meal.servings / meal.recipe.servings);
            } else {
              // Otherwise, add new ingredient
              ingredients[key] = {
                id: "", // Will be assigned by Supabase
                name: ingredient.name,
                quantity:
                  ingredient.quantity * (meal.servings / meal.recipe.servings),
                unit: ingredient.unit,
                category: ingredient.category || "Other",
                isChecked: false,
                groceryListId: groceryListData.id,
              };
            }
          });
        }
      });

      // Insert all ingredients as grocery items
      const groceryItems = Object.values(ingredients);

      if (groceryItems.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from("grocery_items")
          .insert(groceryItems)
          .select();

        if (itemsError) {
          return rejectWithValue(itemsError.message);
        }

        return { ...groceryListData, items: itemsData } as GroceryList;
      }

      return { ...groceryListData, items: [] } as GroceryList;
    } catch (error) {
      return rejectWithValue("Failed to generate grocery list from meal plan");
    }
  }
);

const groceryListSlice = createSlice({
  name: "groceryList",
  initialState,
  reducers: {
    setCurrentGroceryList: (state, action: PayloadAction<GroceryList>) => {
      state.currentGroceryList = action.payload;
    },
    clearCurrentGroceryList: (state) => {
      state.currentGroceryList = null;
    },
    toggleGroceryItemChecked: (state, action: PayloadAction<string>) => {
      if (state.currentGroceryList) {
        const itemIndex = state.currentGroceryList.items.findIndex(
          (item) => item.id === action.payload
        );
        if (itemIndex !== -1) {
          state.currentGroceryList.items[itemIndex].isChecked =
            !state.currentGroceryList.items[itemIndex].isChecked;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user grocery lists
      .addCase(fetchUserGroceryLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGroceryLists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groceryLists = action.payload;
      })
      .addCase(fetchUserGroceryLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch grocery list by ID
      .addCase(fetchGroceryListById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroceryListById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroceryList = action.payload;
      })
      .addCase(fetchGroceryListById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create grocery list
      .addCase(createGroceryList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroceryList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groceryLists.unshift(action.payload);
        state.currentGroceryList = action.payload;
      })
      .addCase(createGroceryList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update grocery list
      .addCase(updateGroceryList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGroceryList.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update in grocery lists array
        const index = state.groceryLists.findIndex(
          (list) => list.id === action.payload.id
        );
        if (index !== -1) {
          // Preserve the items array if it exists in the current state
          const items = state.groceryLists[index].items || [];
          state.groceryLists[index] = { ...action.payload, items };
        }

        // Update current grocery list if it's the same one
        if (state.currentGroceryList?.id === action.payload.id) {
          // Preserve the items array if it exists in the current state
          const items = state.currentGroceryList.items || [];
          state.currentGroceryList = { ...action.payload, items };
        }
      })
      .addCase(updateGroceryList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete grocery list
      .addCase(deleteGroceryList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGroceryList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groceryLists = state.groceryLists.filter(
          (list) => list.id !== action.payload
        );
        if (state.currentGroceryList?.id === action.payload) {
          state.currentGroceryList = null;
        }
      })
      .addCase(deleteGroceryList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add grocery item
      .addCase(addGroceryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addGroceryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (
          state.currentGroceryList &&
          action.payload.groceryListId === state.currentGroceryList.id
        ) {
          state.currentGroceryList.items = [
            ...(state.currentGroceryList.items || []),
            action.payload,
          ];
        }
      })
      .addCase(addGroceryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update grocery item
      .addCase(updateGroceryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGroceryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentGroceryList) {
          const itemIndex = state.currentGroceryList.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (itemIndex !== -1) {
            state.currentGroceryList.items[itemIndex] = action.payload;
          }
        }
      })
      .addCase(updateGroceryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete grocery item
      .addCase(deleteGroceryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGroceryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentGroceryList) {
          state.currentGroceryList.items =
            state.currentGroceryList.items.filter(
              (item) => item.id !== action.payload
            );
        }
      })
      .addCase(deleteGroceryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate grocery list from meal plan
      .addCase(generateGroceryListFromMealPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateGroceryListFromMealPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groceryLists.unshift(action.payload);
        state.currentGroceryList = action.payload;
      })
      .addCase(generateGroceryListFromMealPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentGroceryList,
  clearCurrentGroceryList,
  toggleGroceryItemChecked,
} = groceryListSlice.actions;

export default groceryListSlice.reducer;
