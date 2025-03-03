"use client";

import { useState } from "react";
import {
  Box,
  Image,
  Text,
  Flex,
  Badge,
  IconButton,
  useColorModeValue,
  Tooltip,
  HStack,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaClock, FaUtensils } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@chakra-ui/react";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  tags: string[];
  likes_count: number;
  author_id: string;
  author_name?: string;
  isLiked?: boolean;
}

const RecipeCard = ({
  id,
  title,
  description,
  image_url,
  prep_time,
  cook_time,
  difficulty,
  tags,
  likes_count,
  author_id,
  author_name,
  isLiked = false,
}: RecipeCardProps) => {
  const router = useRouter();
  const toast = useToast();
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(likes_count);
  const { user } = useSelector((state: RootState) => state.auth);

  const cardBg = useColorModeValue("white", "gray.800");
  const tagBg = useColorModeValue("gray.100", "gray.700");

  const handleCardClick = () => {
    router.push(`/recipes/${id}`);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

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
      if (liked) {
        // Unlike recipe
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", id);

        if (error) throw error;

        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like recipe
        const { error } = await supabase
          .from("recipe_likes")
          .insert({ user_id: user.id, recipe_id: id });

        if (error) throw error;

        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${author_id}`);
  };

  // Truncate description
  const truncatedDescription =
    description.length > 100
      ? `${description.substring(0, 100)}...`
      : description;

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      boxShadow="md"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
      cursor="pointer"
      onClick={handleCardClick}
    >
      <Box position="relative" height="200px">
        <Image
          src={image_url || "/images/default-recipe.jpg"}
          alt={title}
          objectFit="cover"
          width="100%"
          height="100%"
        />
        <IconButton
          aria-label={liked ? "Unlike recipe" : "Like recipe"}
          icon={liked ? <FaHeart /> : <FaRegHeart />}
          position="absolute"
          top="2"
          right="2"
          colorScheme={liked ? "red" : "gray"}
          onClick={handleLikeClick}
          size="sm"
          borderRadius="full"
        />
      </Box>

      <Box p="4">
        <Box d="flex" alignItems="baseline">
          <Badge
            borderRadius="full"
            px="2"
            colorScheme={
              difficulty === "easy"
                ? "green"
                : difficulty === "medium"
                ? "yellow"
                : "red"
            }
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
            onClick={handleAuthorClick}
          >
            by {author_name || "Unknown Chef"}
          </Box>
        </Box>

        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {title}
        </Box>

        <Text fontSize="sm" mt="2" noOfLines={2}>
          {truncatedDescription}
        </Text>

        <HStack mt="3" spacing={4}>
          <Flex align="center">
            <FaClock color="gray" />
            <Text ml="1" fontSize="sm">
              {prep_time + cook_time} min
            </Text>
          </Flex>
          <Flex align="center">
            <FaHeart color="red" />
            <Text ml="1" fontSize="sm">
              {likesCount}
            </Text>
          </Flex>
        </HStack>

        <Box mt="3" display="flex" flexWrap="wrap" gap="2">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              bg={tagBg}
              px="2"
              py="1"
              borderRadius="md"
              fontSize="xs"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Tooltip label={tags.slice(3).join(", ")}>
              <Badge bg={tagBg} px="2" py="1" borderRadius="md" fontSize="xs">
                +{tags.length - 3}
              </Badge>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RecipeCard;
