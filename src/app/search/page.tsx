"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Select,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import MainLayout from "../../components/layout/MainLayout";
import RecipeCard from "../../components/recipes/RecipeCard";
import UserCard from "../../components/users/UserCard";
import { supabase } from "../../lib/supabase/client";

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
  likes_count: number;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  recipes_count: number;
  followers_count: number;
}

export default function SearchPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchPopularTags();
    fetchTrendingRecipes();
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      const timer = setTimeout(() => {
        if (activeTab === 0) {
          searchRecipes();
        } else {
          searchUsers();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedTags, difficulty, sortBy, activeTab]);

  const fetchPopularTags = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_popular_tags', { limit_count: 10 });

      if (error) throw error;

      setPopularTags(data || []);
    } catch (error: any) {
      console.error("Error fetching popular tags:", error);
    }
  };

  const fetchTrendingRecipes = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
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
        .eq("is_public", true)
        .order("likes_count", { ascending: false })
        .limit(12);

      if (error) throw error;

      setRecipes(data || []);
    } catch (error: any) {
      console.error("Error fetching trending recipes:", error);
      toast({
        title: "Error",
        description: "Failed to load trending recipes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  const searchRecipes = async () => {
    try {
      setIsLoading(true);

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

      // Apply search query if provided
      if (searchQuery) {
        query = query.textSearch('fts', searchQuery, {
          type: 'websearch',
          config: 'english'
        });
      }

      // Apply tag filters if selected
      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      // Apply difficulty filter if selected
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
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

      const { data, error } = await query.limit(24);

      if (error) throw error;

      setRecipes(data || []);
    } catch (error: any) {
      console.error("Error searching recipes:", error);
      toast({
        title: "Error",
        description: "Failed to search recipes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("users")
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          bio,
          recipes_count,
          followers_count
        `);

      // Apply search query if provided
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      // Sort by popularity (followers count)
      query = query.order("followers_count", { ascending: false });

      const { data, error } = await query.limit(24);

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 0) {
      searchRecipes();
    } else {
      searchUsers();
    }
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    if (index === 0) {
      searchRecipes();
    } else {
      searchUsers();
    }
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setDifficulty("");
    setSortBy("newest");
  };

  return (
    <MainLayout>
      <Container maxW="6xl" py={8}>
        <Heading as="h1" size="xl" mb={6}>
          Search & Discover
        </Heading>

        {/* Search Bar */}
        <Box mb={8}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search for recipes or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              bg={useColorModeValue("white", "gray.700")}
              borderRadius="lg"
              boxShadow="sm"
            />
          </InputGroup>
        </Box>

        {/* Popular Tags */}
        <Box mb={6}>
          <Heading size="md" mb={3}>
            Popular Tags
          </Heading>
          <Wrap spacing={2}>
            {popularTags.map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="brand"
                  opacity={0.8}
                  cursor="pointer"
                  onClick={() => handleTagSelect(tag)}
                >
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Tabs for Recipes and Users */}
        <Tabs
          colorScheme="brand"
          onChange={handleTabChange}
          index={activeTab}
          isLazy
        >
          <TabList mb={6}>
            <Tab>Recipes</Tab>
            <Tab>Users</Tab>
          </TabList>

          <TabPanels>
            {/* Recipes Tab */}
            <TabPanel p={0}>
              {/* Filters for Recipes */}
              <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                mb={6}
                gap={4}
              >
                <Box>
                  {selectedTags.length > 0 && (
                    <Wrap mb={4}>
                      {selectedTags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag
                            size="md"
                            borderRadius="full"
                            variant="subtle"
                            colorScheme="brand"
                          >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleTagRemove(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>

                <HStack spacing={4}>
                  <Select
                    placeholder="Difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    maxW="150px"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>

                  <Select
                    placeholder="Sort by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    maxW="180px"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="most_liked">Most Liked</option>
                    <option value="prep_time_asc">Prep Time (Low to High)</option>
                    <option value="prep_time_desc">Prep Time (High to Low)</option>
                  </Select>

                  {(selectedTags.length > 0 || difficulty || sortBy !== "newest") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </HStack>
              </Flex>

              {isLoading ? (
                <Center py={10}>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="brand.500"
                    size="xl"
                  />
                </Center>
              ) : recipes.length > 0 ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </Grid>
              ) : (
                <Box
                  p={10}
                  borderWidth="1px"
                  borderRadius="lg"
                  textAlign="center"
                  bg={useColorModeValue("white", "gray.700")}
                >
                  <Text fontSize="lg">
                    No recipes found. Try adjusting your search criteria.
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Users Tab */}
            <TabPanel p={0}>
              {isLoading ? (
                <Center py={10}>
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="brand.500"
                    size="xl"
                  />
                </Center>
              ) : users.length > 0 ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </Grid>
              ) : (
                <Box
                  p={10}
                  borderWidth="1px"
                  borderRadius="lg"
                  textAlign="center"
                  bg={useColorModeValue("white", "gray.700")}
                >
                  <Text fontSize="lg">
                    No users found. Try adjusting your search criteria.
                  </Text>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </MainLayout>
  );
}
