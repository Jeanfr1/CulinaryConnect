"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Image,
  Heading,
  Text,
  Flex,
  Badge,
  HStack,
  Avatar,
  IconButton,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaClock } from "react-icons/fa";
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
  likes_count: number;
  author: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.profile);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(recipe.likes_count);

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleClick = () => {
    router.push(`/recipes/${recipe.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      return;
    }

    try {
      if (isLiked) {
        // Unlike recipe
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("recipe_id", recipe.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like recipe
        const { error } = await supabase.from("recipe_likes").insert({
          recipe_id: recipe.id,
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

  // Truncate description
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", shadow: "md" }}
      cursor="pointer"
      onClick={handleClick}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Recipe Image */}
      <Box position="relative" height="200px">
        <Image
          src={recipe.image_url || "/images/default-recipe.jpg"}
          alt={recipe.title}
          objectFit="cover"
          width="100%"
          height="100%"
          fallbackSrc="https://via.placeholder.com/300x200?text=No+Image"
        />

        {/* Difficulty Badge */}
        <Badge
          position="absolute"
          top="10px"
          right="10px"
          colorScheme={
            recipe.difficulty === "easy"
              ? "green"
              : recipe.difficulty === "medium"
              ? "yellow"
              : "red"
          }
          textTransform="capitalize"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="full"
        >
          {recipe.difficulty}
        </Badge>
      </Box>

      {/* Recipe Content */}
      <Box p={4} flex="1" display="flex" flexDirection="column">
        <Heading as="h3" size="md" mb={2} noOfLines={1}>
          {recipe.title}
        </Heading>

        <Text fontSize="sm" color="gray.500" mb={3} flex="1">
          {truncateDescription(recipe.description)}
        </Text>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <Box mb={3}>
            <HStack spacing={2} flexWrap="wrap">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  colorScheme="brand"
                  fontSize="xs"
                  borderRadius="full"
                >
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge colorScheme="gray" fontSize="xs" borderRadius="full">
                  +{recipe.tags.length - 3} more
                </Badge>
              )}
            </HStack>
          </Box>
        )}

        {/* Time and Likes */}
        <Flex justify="space-between" align="center" mt="auto">
          <HStack>
            <FaClock />
            <Text fontSize="sm">{recipe.prep_time + recipe.cook_time} min</Text>
          </HStack>

          <HStack>
            <Tooltip
              label={user ? (isLiked ? "Unlike" : "Like") : "Sign in to like"}
            >
              <IconButton
                aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
                icon={isLiked ? <FaHeart /> : <FaRegHeart />}
                colorScheme={isLiked ? "red" : "gray"}
                onClick={handleLike}
                variant="ghost"
                size="sm"
              />
            </Tooltip>
            <Text fontSize="sm">{likesCount}</Text>
          </HStack>
        </Flex>

        {/* Author */}
        <Flex mt={4} align="center">
          <Avatar
            size="xs"
            name={recipe.author.full_name}
            src={recipe.author.avatar_url || undefined}
            mr={2}
          />
          <Text fontSize="xs" color="gray.500">
            by {recipe.author.username}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
