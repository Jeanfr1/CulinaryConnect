-- Function to get all unique tags from recipes
CREATE OR REPLACE FUNCTION get_all_recipe_tags()
RETURNS SETOF text AS $$
  SELECT DISTINCT unnest(tags)
  FROM recipes
  WHERE is_public = true
  ORDER BY unnest(tags);
$$ LANGUAGE SQL;

-- Function to get popular tags based on recipe count
CREATE OR REPLACE FUNCTION get_popular_tags(limit_count integer DEFAULT 10)
RETURNS SETOF text AS $$
  SELECT unnest(tags) as tag, COUNT(*) as tag_count
  FROM recipes
  WHERE is_public = true
  GROUP BY tag
  ORDER BY tag_count DESC
  LIMIT limit_count;
$$ LANGUAGE SQL;

-- Function to update user stats when a recipe is created
CREATE OR REPLACE FUNCTION update_user_stats_on_recipe_create()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET recipes_created = recipes_created + 1
  WHERE user_id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when a recipe is created
CREATE TRIGGER trigger_update_user_stats_on_recipe_create
AFTER INSERT ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_recipe_create();

-- Function to update user stats when a recipe is liked
CREATE OR REPLACE FUNCTION update_user_stats_on_recipe_like()
RETURNS TRIGGER AS $$
DECLARE
  recipe_author_id uuid;
BEGIN
  -- Get the author of the recipe
  SELECT author_id INTO recipe_author_id
  FROM recipes
  WHERE id = NEW.recipe_id;

  -- Update the recipe likes count
  UPDATE recipes
  SET likes_count = likes_count + 1
  WHERE id = NEW.recipe_id;

  -- Update the user stats for the recipe author
  UPDATE user_stats
  SET recipes_liked = recipes_liked + 1
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when a recipe is liked
CREATE TRIGGER trigger_update_user_stats_on_recipe_like
AFTER INSERT ON recipe_likes
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_recipe_like();

-- Function to update user stats when a recipe is unliked
CREATE OR REPLACE FUNCTION update_user_stats_on_recipe_unlike()
RETURNS TRIGGER AS $$
DECLARE
  recipe_author_id uuid;
BEGIN
  -- Get the author of the recipe
  SELECT author_id INTO recipe_author_id
  FROM recipes
  WHERE id = OLD.recipe_id;

  -- Update the recipe likes count
  UPDATE recipes
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.recipe_id;

  -- Update the user stats for the recipe author
  UPDATE user_stats
  SET recipes_liked = GREATEST(recipes_liked - 1, 0)
  WHERE user_id = OLD.user_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when a recipe is unliked
CREATE TRIGGER trigger_update_user_stats_on_recipe_unlike
AFTER DELETE ON recipe_likes
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_recipe_unlike();

-- Function to update user stats when a user follows another user
CREATE OR REPLACE FUNCTION update_user_stats_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Update follower's following count
  UPDATE user_stats
  SET following = following + 1
  WHERE user_id = NEW.follower_id;

  -- Update followed user's followers count
  UPDATE user_stats
  SET followers = followers + 1
  WHERE user_id = NEW.following_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when a user follows another user
CREATE TRIGGER trigger_update_user_stats_on_follow
AFTER INSERT ON followers
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_follow();

-- Function to update user stats when a user unfollows another user
CREATE OR REPLACE FUNCTION update_user_stats_on_unfollow()
RETURNS TRIGGER AS $$
BEGIN
  -- Update follower's following count
  UPDATE user_stats
  SET following = GREATEST(following - 1, 0)
  WHERE user_id = OLD.follower_id;

  -- Update followed user's followers count
  UPDATE user_stats
  SET followers = GREATEST(followers - 1, 0)
  WHERE user_id = OLD.following_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when a user unfollows another user
CREATE TRIGGER trigger_update_user_stats_on_unfollow
AFTER DELETE ON followers
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_unfollow();

-- Function to search recipes by title, description, or tags
CREATE OR REPLACE FUNCTION search_recipes(search_term text)
RETURNS SETOF recipes AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM recipes
  WHERE
    is_public = true AND
    (
      title ILIKE '%' || search_term || '%' OR
      description ILIKE '%' || search_term || '%' OR
      search_term = ANY(tags)
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search users by username or display name
CREATE OR REPLACE FUNCTION search_users(search_term text)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone,
  recipes_count bigint,
  followers_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.created_at,
    COALESCE((SELECT COUNT(*) FROM recipes r WHERE r.author_id = p.id), 0) as recipes_count,
    COALESCE((SELECT COUNT(*) FROM followers f WHERE f.following_id = p.id), 0) as followers_count
  FROM profiles p
  WHERE
    p.username ILIKE '%' || search_term || '%' OR
    p.display_name ILIKE '%' || search_term || '%'
  ORDER BY followers_count DESC, recipes_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending recipes based on likes and recency
CREATE OR REPLACE FUNCTION get_trending_recipes(limit_count integer DEFAULT 10)
RETURNS SETOF recipes AS $$
BEGIN
  RETURN QUERY
  SELECT r.*
  FROM recipes r
  WHERE r.is_public = true
  ORDER BY
    -- Formula that balances recency and popularity
    (r.likes_count * 10) + (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - r.created_at)) / 86400) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;