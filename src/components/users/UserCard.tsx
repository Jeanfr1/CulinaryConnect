"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Text,
  Avatar,
  Button,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase/client";
import { useAppSelector } from "../../lib/redux/hooks";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    recipes_count: number;
    followers_count: number;
  };
}

export default function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.user.profile);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();

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
      setIsLoading(true);

      if (isFollowing) {
        // Unfollow user
        const { error } = await supabase
          .from("user_followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", user.id);

        if (error) throw error;

        setIsFollowing(false);
      } else {
        // Follow user
        const { error } = await supabase.from("user_followers").insert({
          follower_id: currentUser.id,
          following_id: user.id,
        });

        if (error) throw error;

        setIsFollowing(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToProfile = () => {
    router.push(`/profile/${user.id}`);
  };

  return (
    <Box
      p={5}
      borderRadius="lg"
      boxShadow="md"
      bg={cardBg}
      cursor="pointer"
      onClick={navigateToProfile}
      transition="transform 0.2s"
      _hover={{ transform: "translateY(-5px)" }}
    >
      <Flex direction="column" align="center">
        <Avatar
          size="xl"
          name={user.full_name || user.username}
          src={user.avatar_url || undefined}
          mb={4}
        />

        <Text fontWeight="bold" fontSize="xl" mb={1} textAlign="center">
          {user.full_name}
        </Text>

        <Text color={textColor} fontSize="md" mb={3} textAlign="center">
          @{user.username}
        </Text>

        {user.bio && (
          <Text
            fontSize="sm"
            color={textColor}
            noOfLines={2}
            textAlign="center"
            mb={4}
          >
            {user.bio}
          </Text>
        )}

        <HStack spacing={6} mb={4}>
          <VStack spacing={0}>
            <Text fontWeight="bold">{user.recipes_count || 0}</Text>
            <Text fontSize="sm" color={textColor}>
              Recipes
            </Text>
          </VStack>

          <VStack spacing={0}>
            <Text fontWeight="bold">{user.followers_count || 0}</Text>
            <Text fontSize="sm" color={textColor}>
              Followers
            </Text>
          </VStack>
        </HStack>

        {currentUser && currentUser.id !== user.id && (
          <Button
            colorScheme={isFollowing ? "gray" : "brand"}
            size="sm"
            width="full"
            onClick={handleFollow}
            isLoading={isLoading}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Flex>
    </Box>
  );
}
