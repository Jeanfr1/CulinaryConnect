import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  dietary_restrictions?: string[];
  favorite_cuisines?: string[];
  notification_preferences?: {
    email: boolean;
    push: boolean;
  };
}

export interface UserStats {
  user_id: string;
  recipes_created: number;
  recipes_liked: number;
  followers_count: number;
  following_count: number;
}

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    setUserPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },
    setUserStats: (state, action: PayloadAction<UserStats>) => {
      state.stats = action.payload;
    },
    clearUser: (state) => {
      state.profile = null;
      state.preferences = null;
      state.stats = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = {
          ...state.profile,
          ...action.payload,
          updated_at: new Date().toISOString(),
        };
      }
    },
    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      if (state.preferences) {
        state.preferences = {
          ...state.preferences,
          ...action.payload,
        };
      }
    },
  },
});

export const {
  setUser,
  setUserPreferences,
  setUserStats,
  clearUser,
  setLoading,
  setError,
  updateUserProfile,
  updateUserPreferences,
} = userSlice.actions;

export default userSlice.reducer;
