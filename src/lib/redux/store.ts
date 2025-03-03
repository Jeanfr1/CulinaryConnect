import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

// Import reducers (we'll create these next)
import userReducer from "./slices/userSlice";
import recipesReducer from "./slices/recipesSlice";
import mealPlanReducer from "./slices/mealPlanSlice";
import groceryListReducer from "./slices/groceryListSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "mealPlan", "groceryList"], // Only persist these slices
};

const rootReducer = combineReducers({
  user: userReducer,
  recipes: recipesReducer,
  mealPlan: mealPlanReducer,
  groceryList: groceryListReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
