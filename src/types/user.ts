export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCategories: string[];
  measurementSystem: "metric" | "imperial";
  emailNotifications: boolean;
  darkMode: boolean;
}

export interface UserStats {
  recipesCreated: number;
  recipesLiked: number;
  followers: number;
  following: number;
  cookingStreak: number; // Number of consecutive days with cooking activity
}

export interface UserRelationship {
  followerId: string;
  followingId: string;
  createdAt: string;
}
