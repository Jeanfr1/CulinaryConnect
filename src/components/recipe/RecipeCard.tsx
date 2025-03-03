"use client";

import {
  Box,
  Image,
  Text,
  Stack,
  Heading,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { FaClock, FaUtensils, FaHeart } from "react-icons/fa";
import NextLink from "next/link";
import { Recipe } from "../../types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const {
    id,
    title,
    description,
    imageUrl,
    prepTime,
    cookTime,
    difficulty,
    tags,
    likes,
  } = recipe;

  const totalTime = prepTime + cookTime;
  const formattedTime =
    totalTime >= 60
      ? `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`
      : `${totalTime}m`;

  const difficultyColor = {
    easy: "green",
    medium: "orange",
    hard: "red",
  }[difficulty];

  return (
    <Box
      as={NextLink}
      href={`/recipes/${id}`}
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue("white", "gray.800")}
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
        textDecoration: "none",
      }}
    >
      <Box position="relative" height="200px">
        <Image
          src={imageUrl}
          alt={title}
          objectFit="cover"
          width="100%"
          height="100%"
        />
        <HStack position="absolute" top="10px" right="10px" spacing={2}>
          <Badge colorScheme={difficultyColor} borderRadius="full" px={2}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </HStack>
      </Box>

      <Box p={4}>
        <Stack spacing={2}>
          <Heading as="h3" size="md" noOfLines={1}>
            {title}
          </Heading>
          <Text color={useColorModeValue("gray.600", "gray.400")} noOfLines={2}>
            {description}
          </Text>
        </Stack>

        <HStack mt={4} spacing={4}>
          <Flex align="center">
            <Icon as={FaClock} color="gray.500" mr={1} />
            <Text fontSize="sm" color="gray.500">
              {formattedTime}
            </Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaHeart} color="red.500" mr={1} />
            <Text fontSize="sm" color="gray.500">
              {likes}
            </Text>
          </Flex>
        </HStack>

        <HStack mt={4} spacing={2} flexWrap="wrap">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              colorScheme="brand"
              variant="subtle"
              borderRadius="full"
              px={2}
              py={1}
              fontSize="xs"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge
              colorScheme="gray"
              variant="subtle"
              borderRadius="full"
              px={2}
              py={1}
              fontSize="xs"
            >
              +{tags.length - 3}
            </Badge>
          )}
        </HStack>
      </Box>
    </Box>
  );
}
