# Authentication in CulinaryConnect

This document outlines the authentication system used in the CulinaryConnect application.

## Overview

CulinaryConnect uses Supabase for authentication and user management. The authentication flow includes:

1. User registration and login
2. Session management
3. Protected routes
4. User profile management

## Setup

The authentication system requires the following environment variables to be set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Flow

### Registration

1. User enters email, username, and password
2. System checks if the username is already taken
3. If username is available, creates a new user in Supabase Auth
4. Creates a user profile in the `users` table
5. Creates default user preferences and stats

### Login

1. User enters email and password
2. Supabase validates credentials
3. On successful login, the user's profile is fetched and stored in Redux
4. User is redirected to the home page

### Session Management

- The `AuthContext` provides authentication state throughout the application
- It listens for auth state changes (sign in, sign out)
- Updates the Redux store with user information

## Protected Routes

The `ProtectedRoute` component ensures that certain pages are only accessible to authenticated users:

- Checks if the user is authenticated
- If not authenticated, redirects to the login page
- Shows a loading spinner while checking authentication status

## User Profile Management

Users can manage their profile information:

- Update username and full name
- Upload a profile picture
- Set dietary restrictions and favorite cuisines
- Configure notification preferences

## Database Schema

The authentication system uses the following tables:

- `users`: Stores user profile information
- `user_preferences`: Stores user preferences
- `user_stats`: Tracks user activity statistics

## Row Level Security (RLS)

Supabase RLS policies ensure that users can only access their own data:

- Users can read and update their own profile
- Users can read and update their own preferences
- Public profiles are readable by all users

## Implementation Files

- `src/lib/supabase/client.ts`: Supabase client setup and helper functions
- `src/lib/context/AuthContext.tsx`: Authentication context provider
- `src/app/auth/page.tsx`: Login and registration page
- `src/components/auth/ProtectedRoute.tsx`: Protected route component
- `src/lib/redux/slices/userSlice.ts`: Redux state for user data

## Testing Authentication

To test the authentication system:

1. Create a test user through the registration form
2. Verify that you can log in with the created credentials
3. Test protected routes by trying to access them while logged out
4. Verify that user profile updates are persisted
