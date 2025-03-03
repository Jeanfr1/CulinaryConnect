"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/layout/MainLayout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import RecipeCard from "../../../components/recipes/RecipeCard";
import { supabase } from "../../../lib/supabase/client";
import { useAppSelector } from "../../../lib/redux/hooks";

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

export default function MyRecipesPage() {
  return (
    <ProtectedRoute>
      <MyRecipesContent />
    </ProtectedRoute>
  );
}

function MyRecipesContent() {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.user.profile);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchMyRecipes();
    }
  }, [user]);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);

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
        .eq("author_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRecipes(data as Recipe[]);
    } catch (error: any) {
      console.error("Error fetching recipes:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load your recipes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = () => {
    router.push("/recipes/create");
  };

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
            My Recipes
          </Heading>

          <Button
            leftIcon={<AddIcon />}
            colorScheme="brand"
            onClick={handleCreateRecipe}
          >
            Create Recipe
          </Button>
        </Flex>

        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {loading ? (
          <Center py={10}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
          </Center>
        ) : recipes.length === 0 ? (
          <Box
            p={10}
            borderWidth="1px"
            borderRadius="lg"
            textAlign="center"
            bg={useColorModeValue("white", "gray.700")}
          >
            <Text fontSize="lg" mb={4}>
              You haven't created any recipes yet.
            </Text>
            <Button
              colorScheme="brand"
              onClick={handleCreateRecipe}
              leftIcon={<AddIcon />}
            >
              Create Your First Recipe
            </Button>
          </Box>
        ) : (
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
        )}
      </Container>
    </MainLayout>
  );
}
