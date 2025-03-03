"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, getCurrentUser, getUserProfile } from "../supabase/client";
import { useAppDispatch } from "../redux/hooks";
import { setUser, clearUser } from "../redux/slices/userSlice";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  authUser: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  authUser: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setAuthUser(session.user);
          setIsAuthenticated(true);

          // Fetch user profile and set in Redux
          const userProfile = await getUserProfile(session.user.id);
          if (userProfile) {
            dispatch(setUser(userProfile));
          }
        } else {
          setAuthUser(null);
          setIsAuthenticated(false);
          dispatch(clearUser());
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthUser(null);
        setIsAuthenticated(false);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user);
        setIsAuthenticated(true);

        // Fetch user profile and set in Redux
        const userProfile = await getUserProfile(session.user.id);
        if (userProfile) {
          dispatch(setUser(userProfile));
        }
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setIsAuthenticated(false);
        dispatch(clearUser());
      }
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        authUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
