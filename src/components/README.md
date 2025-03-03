# CulinaryConnect Components

This directory contains reusable components used throughout the CulinaryConnect application.

## Recipe Components

### RecipeCard

A card component for displaying recipe information in a compact format. Used in search results, recipe listings, and user profiles.

**Props:**

- `id`: Recipe ID
- `title`: Recipe title
- `description`: Recipe description
- `image_url`: URL to the recipe image
- `prep_time`: Preparation time in minutes
- `cook_time`: Cooking time in minutes
- `difficulty`: Difficulty level (easy, medium, hard)
- `tags`: Array of recipe tags
- `likes_count`: Number of likes
- `author_id`: ID of the recipe author
- `author_name`: Name of the recipe author (optional)
- `isLiked`: Whether the current user has liked the recipe (optional)

**Features:**

- Displays recipe image, title, description, and metadata
- Shows recipe difficulty with appropriate color coding
- Displays preparation and cooking time
- Shows like count and allows users to like/unlike recipes
- Truncates long descriptions
- Displays up to 3 tags with a count for additional tags
- Links to the recipe detail page and author profile

## User Components

### UserCard

A card component for displaying user information. Used in search results, followers/following lists, and user recommendations.

**Props:**

- `id`: User ID
- `username`: Username
- `display_name`: Display name
- `avatar_url`: URL to the user's avatar
- `bio`: User bio
- `recipes_count`: Number of recipes created by the user
- `followers_count`: Number of followers
- `isFollowing`: Whether the current user is following this user (optional)

**Features:**

- Displays user avatar, name, and username
- Shows user bio with truncation for long text
- Displays recipe count and follower count
- Allows users to follow/unfollow directly from the card
- Links to the user's profile page

## UI Components

### TagSelector

A component for selecting and filtering by tags. Used in search interfaces and recipe creation/editing forms.

**Props:**

- `availableTags`: Array of available tags to choose from
- `selectedTags`: Array of currently selected tags
- `onChange`: Callback function when tags change
- `allowCustomTags`: Whether to allow users to create custom tags (optional)

**Features:**

- Displays available tags for selection
- Shows currently selected tags with remove option
- Provides search functionality to filter available tags
- Supports custom tag creation when enabled
- Handles tag selection and deselection
- Provides visual feedback for selected tags

## Usage Examples

### RecipeCard

```jsx
<RecipeCard
  id="123"
  title="Spaghetti Carbonara"
  description="A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper."
  image_url="/images/carbonara.jpg"
  prep_time={15}
  cook_time={20}
  difficulty="medium"
  tags={["pasta", "italian", "quick"]}
  likes_count={42}
  author_id="user123"
  author_name="Chef Mario"
  isLiked={false}
/>
```

### UserCard

```jsx
<UserCard
  id="user123"
  username="chefmario"
  display_name="Chef Mario"
  avatar_url="/images/mario.jpg"
  bio="Italian chef specializing in authentic pasta dishes."
  recipes_count={24}
  followers_count={156}
  isFollowing={true}
/>
```

### TagSelector

```jsx
<TagSelector
  availableTags={["italian", "pasta", "vegetarian", "dessert", "quick"]}
  selectedTags={["pasta", "quick"]}
  onChange={(newTags) => setSelectedTags(newTags)}
  allowCustomTags={false}
/>
```

## Styling

All components use Chakra UI for styling and are responsive across different screen sizes. They also respect the application's color mode (light/dark) settings.
