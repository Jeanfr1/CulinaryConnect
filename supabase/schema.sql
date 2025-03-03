-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[] DEFAULT '{}',
  favorite_categories TEXT[] DEFAULT '{}',
  measurement_system TEXT DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial')),
  email_notifications BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipes_created INTEGER DEFAULT 0,
  recipes_liked INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  cooking_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user relationships table
CREATE TABLE IF NOT EXISTS user_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  prep_time INTEGER NOT NULL CHECK (prep_time >= 0),
  cook_time INTEGER NOT NULL CHECK (cook_time >= 0),
  servings INTEGER NOT NULL CHECK (servings > 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  likes INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE
);

-- Create recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'Other'
);

-- Create recipe steps table
CREATE TABLE IF NOT EXISTS recipe_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  description TEXT NOT NULL,
  image_url TEXT,
  timers INTEGER[] DEFAULT '{}'
);

-- Create recipe nutrition table
CREATE TABLE IF NOT EXISTS recipe_nutrition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein DECIMAL NOT NULL CHECK (protein >= 0),
  carbs DECIMAL NOT NULL CHECK (carbs >= 0),
  fat DECIMAL NOT NULL CHECK (fat >= 0),
  fiber DECIMAL CHECK (fiber >= 0),
  sugar DECIMAL CHECK (sugar >= 0)
);

-- Create recipe likes table
CREATE TABLE IF NOT EXISTS recipe_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(recipe_id, user_id)
);

-- Create recipe comments table
CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CHECK (end_date >= start_date)
);

-- Create planned meals table
CREATE TABLE IF NOT EXISTS planned_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert')),
  servings INTEGER NOT NULL CHECK (servings > 0),
  notes TEXT
);

-- Create grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE
);

-- Create grocery items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grocery_list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  is_checked BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view other users' profiles"
ON users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Anyone can view public recipes"
ON recipes FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own private recipes"
ON recipes FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create recipes"
ON recipes FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own recipes"
ON recipes FOR DELETE USING (auth.uid() = author_id);

-- Recipe ingredients policies
CREATE POLICY "Anyone can view ingredients of public recipes"
ON recipe_ingredients FOR SELECT
USING (
  (SELECT is_public FROM recipes WHERE id = recipe_id) = true
);

CREATE POLICY "Users can view ingredients of their own recipes"
ON recipe_ingredients FOR SELECT
USING (
  (SELECT author_id FROM recipes WHERE id = recipe_id) = auth.uid()
);

CREATE POLICY "Users can create ingredients for their recipes"
ON recipe_ingredients FOR INSERT
WITH CHECK (
  (SELECT author_id FROM recipes WHERE id = recipe_id) = auth.uid()
);

CREATE POLICY "Users can update ingredients of their recipes"
ON recipe_ingredients FOR UPDATE
USING (
  (SELECT author_id FROM recipes WHERE id = recipe_id) = auth.uid()
);

CREATE POLICY "Users can delete ingredients of their recipes"
ON recipe_ingredients FOR DELETE
USING (
  (SELECT author_id FROM recipes WHERE id = recipe_id) = auth.uid()
);

-- Similar policies for other tables...

-- Create functions and triggers
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON meal_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
BEFORE UPDATE ON grocery_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to update recipe likes count
CREATE OR REPLACE FUNCTION update_recipe_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes SET likes = likes + 1 WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes SET likes = likes - 1 WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recipe likes
CREATE TRIGGER update_recipe_likes
AFTER INSERT OR DELETE ON recipe_likes
FOR EACH ROW
EXECUTE FUNCTION update_recipe_likes_count();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_recipe_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_stats SET recipes_created = recipes_created + 1 WHERE user_id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_stats SET recipes_created = recipes_created - 1 WHERE user_id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user recipe stats
CREATE TRIGGER update_user_recipe_stats
AFTER INSERT OR DELETE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_user_recipe_stats();

-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_stats SET followers = followers + 1 WHERE user_id = NEW.following_id;
    UPDATE user_stats SET following = following + 1 WHERE user_id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_stats SET followers = followers - 1 WHERE user_id = OLD.following_id;
    UPDATE user_stats SET following = following - 1 WHERE user_id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follower counts
CREATE TRIGGER update_follower_counts
AFTER INSERT OR DELETE ON user_relationships
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();