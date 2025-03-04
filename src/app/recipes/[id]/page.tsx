"use client";

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

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Image,
  Badge,
  Button,
  HStack,
  VStack,
  Avatar,
  Divider,
  List,
  ListItem,
  ListIcon,
  IconButton,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  FaHeart,
  FaRegHeart,
  FaClock,
  FaUtensils,
  FaUser,
  FaCheckCircle,
} from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "../../../components/layout/MainLayout";
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

interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string | null;
}

interface Step {
  id: string;
  recipe_id: string;
  step_number: number;
  description: string;
  image_url: string | null;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.id as string;
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.user.profile);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  useEffect(() => {
    if (recipe && user) {
      checkIfLiked();
    }
  }, [recipe, user]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);

      // Fetch recipe
      const { data: recipeData, error: recipeError } = await supabase
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
        .eq("id", recipeId)
        .single();

      if (recipeError) throw recipeError;

      if (!recipeData) {
        throw new Error("Recipe not found");
      }

      setRecipe(recipeData as Recipe);
      setLikesCount(recipeData.likes_count);

      // Fetch ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("id");

      if (ingredientsError) throw ingredientsError;

      setIngredients(ingredientsData || []);

      // Fetch steps
      const { data: stepsData, error: stepsError } = await supabase
        .from("recipe_steps")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("step_number");

      if (stepsError) throw stepsError;

      setSteps(stepsData || []);
    } catch (error: any) {
      console.error("Error fetching recipe:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load recipe",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_likes")
        .select("*")
        .eq("recipe_id", recipeId)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking if recipe is liked:", error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like recipes",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike recipe
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like recipe
        const { error } = await supabase.from("recipe_likes").insert({
          recipe_id: recipeId,
          user_id: user.id,
        });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddToMealPlan = () => {
    // Implement add to meal plan functionality
    toast({
      title: "Feature coming soon",
      description: "Adding to meal plan will be available soon",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleViewAuthor = () => {
    if (recipe?.author_id) {
      router.push(`/profile/${recipe.author_id}`);
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

  if (error) {
    return (
      <MainLayout>
        <Container maxW="6xl" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  if (!recipe) {
    return (
      <MainLayout>
        <Container maxW="6xl" py={8}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            Recipe not found
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="6xl" py={8}>
        {/* Recipe Header */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8} mb={8}>
          {/* Recipe Image */}
          <GridItem>
            <Box
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              bg={useColorModeValue("white", "gray.700")}
            >
              <Image
                src={recipe.image_url || "/images/default-recipe.jpg"}
                alt={recipe.title}
                objectFit="cover"
                width="100%"
                height="400px"
                fallbackSrc="https://via.placeholder.com/600x400?text=No+Image"
              />
            </Box>
          </GridItem>

          {/* Recipe Info */}
          <GridItem>
            <Box
              bg={useColorModeValue("white", "gray.700")}
              p={6}
              borderRadius="lg"
              boxShadow="md"
              height="100%"
            >
              <VStack align="stretch" spacing={4}>
                <Heading as="h1" size="xl">
                  {recipe.title}
                </Heading>

                <Text fontSize="lg" color="gray.600">
                  {recipe.description}
                </Text>

                <HStack>
                  <Badge
                    colorScheme={
                      recipe.difficulty === "easy"
                        ? "green"
                        : recipe.difficulty === "medium"
                        ? "yellow"
                        : "red"
                    }
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {recipe.difficulty}
                  </Badge>

                  {recipe.tags.map((tag) => (
                    <Badge
                      key={tag}
                      colorScheme="brand"
                      fontSize="sm"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>

                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={2}
                >
                  <HStack>
                    <FaClock />
                    <Text>Prep: {recipe.prep_time} min</Text>
                  </HStack>

                  <HStack>
                    <FaClock />
                    <Text>Cook: {recipe.cook_time} min</Text>
                  </HStack>

                  <HStack>
                    <FaUtensils />
                    <Text>Servings: {recipe.servings}</Text>
                  </HStack>
                </Flex>

                <Divider />

                <Flex align="center">
                  <Avatar
                    size="sm"
                    name={recipe.author.full_name || recipe.author.username}
                    src={recipe.author.avatar_url || undefined}
                    mr={2}
                  />
                  <Text fontSize="sm">
                    By{" "}
                    <Button
                      variant="link"
                      colorScheme="brand"
                      onClick={handleViewAuthor}
                    >
                      {recipe.author.username}
                    </Button>
                  </Text>
                </Flex>

                <HStack spacing={4} mt={2}>
                  <Button
                    leftIcon={isLiked ? <FaHeart /> : <FaRegHeart />}
                    colorScheme={isLiked ? "red" : "gray"}
                    variant="outline"
                    onClick={handleLike}
                  >
                    {isLiked ? "Liked" : "Like"} ({likesCount})
                  </Button>

                  <Button
                    leftIcon={<FaUser />}
                    colorScheme="brand"
                    variant="outline"
                    onClick={handleAddToMealPlan}
                  >
                    Add to Meal Plan
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>

        {/* Recipe Content */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8}>
          {/* Ingredients */}
          <GridItem>
            <Box
              bg={useColorModeValue("white", "gray.700")}
              p={6}
              borderRadius="lg"
              boxShadow="md"
            >
              <Heading as="h2" size="lg" mb={4}>
                Ingredients
              </Heading>

              <List spacing={3}>
                {ingredients.map((ingredient) => (
                  <ListItem key={ingredient.id} display="flex">
                    <ListIcon as={FaCheckCircle} color="brand.500" mt={1} />
                    <Text>
                      {ingredient.quantity && ingredient.unit
                        ? `${ingredient.quantity} ${ingredient.unit} `
                        : ""}
                      <Text as="span" fontWeight="bold">
                        {ingredient.name}
                      </Text>
                    </Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          </GridItem>

          {/* Steps */}
          <GridItem>
            <Box
              bg={useColorModeValue("white", "gray.700")}
              p={6}
              borderRadius="lg"
              boxShadow="md"
            >
              <Heading as="h2" size="lg" mb={4}>
                Instructions
              </Heading>

              <VStack align="stretch" spacing={6}>
                {steps.map((step) => (
                  <Box key={step.id}>
                    <Flex align="center" mb={2}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="full"
                        bg="brand.500"
                        color="white"
                        w="30px"
                        h="30px"
                        fontSize="sm"
                        fontWeight="bold"
                        mr={3}
                      >
                        {step.step_number}
                      </Box>
                      <Text fontWeight="bold">Step {step.step_number}</Text>
                    </Flex>

                    <Text ml={10}>{step.description}</Text>

                    {step.image_url && (
                      <Box mt={3} ml={10}>
                        <Image
                          src={step.image_url}
                          alt={`Step ${step.step_number}`}
                          borderRadius="md"
                          maxH="200px"
                          objectFit="cover"
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </MainLayout>
  );
}
