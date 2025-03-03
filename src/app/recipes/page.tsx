"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Tag,
  TagLabel,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import MainLayout from "../../components/layout/MainLayout";
import RecipeCard from "../../components/recipes/RecipeCard";
import { supabase } from "../../lib/supabase/client";
import { useAppSelector } from "../../lib/redux/hooks";

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_public: boolean;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export default function RecipesPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.user.profile);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [difficulty, setDifficulty] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipes();
    fetchTags();
  }, [sortBy, difficulty, selectedTags]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("recipes")
        .select(
          `
          *,
          author:author_id (
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("is_public", true);

      // Apply difficulty filter
      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      // Apply tag filters
      if (selectedTags.length > 0) {
        query = query.contains("tags", selectedTags);
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "most_liked":
          query = query.order("likes_count", { ascending: false });
          break;
        case "prep_time_asc":
          query = query.order("prep_time", { ascending: true });
          break;
        case "prep_time_desc":
          query = query.order("prep_time", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecipes(data as Recipe[]);
    } catch (error: any) {
      console.error("Error fetching recipes:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load recipes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase.rpc("get_all_recipe_tags");

      if (error) throw error;

      setAvailableTags(data || []);
    } catch (error: any) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleSearch = () => {
    fetchRecipes();
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateRecipe = () => {
    router.push("/recipes/create");
  };

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Container maxW="6xl" py={8}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          mb={6}
        >
          <Heading as="h1" size="xl" mb={{ base: 4, md: 0 }}>
            Recipes
          </Heading>

          <Button
            leftIcon={<AddIcon />}
            colorScheme="brand"
            onClick={handleCreateRecipe}
          >
            Create Recipe
          </Button>
        </Flex>

        {/* Search and Filters */}
        <Box
          bg={useColorModeValue("white", "gray.700")}
          p={6}
          borderRadius="md"
          shadow="md"
          mb={8}
        >
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Flex direction={{ base: "column", md: "row" }} gap={4}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                flex={{ base: "1", md: "1" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_liked">Most Liked</option>
                <option value="prep_time_asc">Prep Time (Low to High)</option>
                <option value="prep_time_desc">Prep Time (High to Low)</option>
              </Select>

              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                flex={{ base: "1", md: "1" }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </Flex>

            {availableTags.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Filter by Tags:
                </Text>
                <Flex flexWrap="wrap" gap={2}>
                  {availableTags.map((tag) => (
                    <Tag
                      key={tag}
                      size="md"
                      borderRadius="full"
                      variant={selectedTags.includes(tag) ? "solid" : "outline"}
                      colorScheme="brand"
                      cursor="pointer"
                      onClick={() => handleTagSelect(tag)}
                    >
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Recipe Grid */}
        {loading ? (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="xl" color="brand.500" />
          </Flex>
        ) : error ? (
          <Box textAlign="center" p={8}>
            <Heading size="md" mb={4}>
              Error Loading Recipes
            </Heading>
            <Text>{error}</Text>
            <Button mt={4} colorScheme="brand" onClick={fetchRecipes}>
              Try Again
            </Button>
          </Box>
        ) : filteredRecipes.length === 0 ? (
          <Box textAlign="center" p={8}>
            <Heading size="md" mb={4}>
              No Recipes Found
            </Heading>
            <Text>Try adjusting your search or filters</Text>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
