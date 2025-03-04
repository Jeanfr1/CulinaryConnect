// Export generateStaticParams for static site generation
export async function generateStaticParams() {
  // For static export, we'll generate a few placeholder IDs
  // In a real app, you would fetch these from your database
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    // Add more IDs as needed
  ];
}

("use client");

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  Avatar,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
  Badge,
} from "@chakra-ui/react";
import MainLayout from "../../../components/layout/MainLayout";
import RecipeCard from "../../../components/recipes/RecipeCard";
import { supabase } from "../../../lib/supabase/client";
import { useAppSelector } from "../../../lib/redux/hooks";

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface UserStats {
  user_id: string;
  recipes_created: number;
  recipes_liked: number;
  followers_count: number;
  following_count: number;
}

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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.user.profile);

  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (user && currentUser) {
      checkIfFollowing();
    }
  }, [user, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      if (!userData) {
        throw new Error("User not found");
      }

      setUser(userData);

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (statsError) throw statsError;

      setUserStats(
        statsData || {
          user_id: userId,
          recipes_created: 0,
          recipes_liked: 0,
          followers_count: 0,
          following_count: 0,
        }
      );

      // Fetch user's public recipes
      const { data: recipesData, error: recipesError } = await supabase
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
        .eq("author_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (recipesError) throw recipesError;

      setRecipes(recipesData || []);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfFollowing = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("user_followers")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", userId)
        .maybeSingle();

      if (error) throw error;

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow user
        const { error } = await supabase
          .from("user_followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId);

        if (error) throw error;

        setIsFollowing(false);
        setUserStats((prev) =>
          prev ? { ...prev, followers_count: prev.followers_count - 1 } : null
        );
      } else {
        // Follow user
        const { error } = await supabase.from("user_followers").insert({
          follower_id: currentUser.id,
          following_id: userId,
        });

        if (error) throw error;

        setIsFollowing(true);
        setUserStats((prev) =>
          prev ? { ...prev, followers_count: prev.followers_count + 1 } : null
        );
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Center h="calc(100vh - 200px)">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500"
            size="xl"
          />
        </Center>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <Container maxW="6xl" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error || "User not found"}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="6xl" py={8}>
        {/* Profile Header */}
        <Box
          bg={useColorModeValue("white", "gray.700")}
          p={6}
          borderRadius="lg"
          boxShadow="md"
          mb={8}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            gap={6}
          >
            <Avatar
              size="2xl"
              name={user.full_name || user.username}
              src={user.avatar_url || undefined}
              mb={{ base: 4, md: 0 }}
            />

            <VStack align="flex-start" spacing={3} flex="1">
              <Heading as="h1" size="xl">
                {user.full_name}
              </Heading>
              <Text fontSize="lg" color="gray.500">
                @{user.username}
              </Text>

              {user.bio && (
                <Text mt={2} fontSize="md">
                  {user.bio}
                </Text>
              )}

              <HStack spacing={6} mt={4}>
                <VStack spacing={0} align="center">
                  <Text fontWeight="bold" fontSize="xl">
                    {userStats?.recipes_created || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Recipes
                  </Text>
                </VStack>

                <VStack spacing={0} align="center">
                  <Text fontWeight="bold" fontSize="xl">
                    {userStats?.followers_count || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Followers
                  </Text>
                </VStack>

                <VStack spacing={0} align="center">
                  <Text fontWeight="bold" fontSize="xl">
                    {userStats?.following_count || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Following
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {currentUser && currentUser.id !== userId && (
              <Button
                colorScheme={isFollowing ? "gray" : "brand"}
                onClick={handleFollow}
                alignSelf={{ base: "center", md: "flex-start" }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Flex>
        </Box>

        {/* User Content */}
        <Tabs colorScheme="brand" isLazy>
          <TabList mb={6}>
            <Tab>Recipes</Tab>
            <Tab>Liked Recipes</Tab>
          </TabList>

          <TabPanels>
            {/* Recipes Tab */}
            <TabPanel p={0}>
              {recipes.length > 0 ? (
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
                    {user.username} hasn't shared any recipes yet.
                  </Text>
                </Box>
              )}
            </TabPanel>

            {/* Liked Recipes Tab */}
            <TabPanel p={0}>
              <Box
                p={10}
                borderWidth="1px"
                borderRadius="lg"
                textAlign="center"
                bg={useColorModeValue("white", "gray.700")}
              >
                <Text fontSize="lg">
                  Liked recipes are not publicly visible.
                </Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </MainLayout>
  );
}
