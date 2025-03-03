# Search and Discovery Feature

This directory contains the implementation of the search and discovery feature for CulinaryConnect. This feature allows users to search for recipes and users, with various filtering and sorting options.

## Components

### Search Page (`page.tsx`)

The main search page component that provides:

- A search input for querying recipes and users
- Tabs to switch between recipe and user search results
- Filters for recipes (difficulty, tags)
- Sorting options for recipes (newest, oldest, most liked, least liked)
- Display of trending recipes when no search is performed
- Display of popular tags for easy filtering

### Required Components

The search feature relies on the following components:

- `RecipeCard`: Displays recipe information in a card format
- `UserCard`: Displays user information in a card format
- `TagSelector`: Allows selection of tags for filtering recipes

## Database Functions

The search feature uses several Supabase database functions:

### `search_recipes(search_term text)`

Searches for recipes by title, description, or tags.

```sql
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
```

### `search_users(search_term text)`

Searches for users by username or display name.

```sql
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
```

### `get_popular_tags(limit_count integer)`

Gets popular tags based on recipe count.

```sql
CREATE OR REPLACE FUNCTION get_popular_tags(limit_count integer DEFAULT 10)
RETURNS SETOF text AS $$
  SELECT unnest(tags) as tag, COUNT(*) as tag_count
  FROM recipes
  WHERE is_public = true
  GROUP BY tag
  ORDER BY tag_count DESC
  LIMIT limit_count;
$$ LANGUAGE SQL;
```

### `get_trending_recipes(limit_count integer)`

Gets trending recipes based on likes and recency.

```sql
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
```

## Usage

The search page is accessible at `/search`. It accepts the following URL parameters:

- `q`: The search query
- `tab`: The active tab (`recipes` or `users`)

Example: `/search?q=pasta&tab=recipes`

## Features

1. **Recipe Search**:

   - Search by title, description, or tags
   - Filter by difficulty level
   - Filter by tags
   - Sort by various criteria

2. **User Search**:

   - Search by username or display name
   - View user stats (recipe count, follower count)
   - Follow/unfollow users directly from search results

3. **Tag Selection**:

   - View and select from popular tags
   - Filter recipes by selected tags

4. **Trending Recipes**:
   - View trending recipes when no search is performed
   - Trending algorithm considers both likes and recency

## Future Enhancements

Potential future enhancements for the search feature:

- Advanced filtering (cooking time, ingredients, etc.)
- Search history and saved searches
- Recipe recommendations based on user preferences
- Infinite scrolling for search results
- Search analytics to improve search relevance
