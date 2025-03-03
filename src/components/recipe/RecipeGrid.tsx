"use client";

import { SimpleGrid, Box, Text, Center, Spinner } from "@chakra-ui/react";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../../types/recipe";

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading?: boolean;
  emptyMessage?: string;
  columns?: { base: number; md: number; lg: number; xl: number };
}

export default function RecipeGrid({
  recipes,
  isLoading = false,
  emptyMessage = "No recipes found",
  columns = { base: 1, md: 2, lg: 3, xl: 4 },
}: RecipeGridProps) {
  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.600"
          size="xl"
        />
      </Center>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <Center py={10}>
        <Text color="gray.500">{emptyMessage}</Text>
      </Center>
    );
  }

  return (
    <SimpleGrid columns={columns} spacing={8} w="100%">
      {recipes.map((recipe) => (
        <Box key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </Box>
      ))}
    </SimpleGrid>
  );
}
