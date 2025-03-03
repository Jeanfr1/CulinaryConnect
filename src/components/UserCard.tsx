"use client";

import { useState } from "react";
import {
  Box,
  Avatar,
  Text,
  Flex,
  Button,
  useColorModeValue,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@chakra-ui/react";

interface UserCardProps {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  recipes_count: number;
  followers_count: number;
  isFollowing?: boolean;
}

const UserCard = ({
  id,
  username,
  display_name,
  avatar_url,
  bio,
  recipes_count,
  followers_count,
  isFollowing = false,
}: UserCardProps) => {
  const router = useRouter();
  const toast = useToast();
  const [following, setFollowing] = useState(isFollowing);
  const [followersCount, setFollowersCount] = useState(followers_count);
  const { user } = useSelector((state: RootState) => state.auth);

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleCardClick = () => {
    router.push(`/profile/${id}`);
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (user.id === id) {
      toast({
        title: "Cannot follow yourself",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (following) {
        // Unfollow user
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", id);

        if (error) throw error;

        setFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        // Follow user
        const { error } = await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: id });

        if (error) throw error;

        setFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Truncate bio
  const truncatedBio =
    bio && bio.length > 100 ? `${bio.substring(0, 100)}...` : bio;

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      boxShadow="md"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
      cursor="pointer"
      onClick={handleCardClick}
      width="100%"
    >
      <Flex direction={{ base: "column", md: "row" }} align="center">
        <Avatar
          size="xl"
          src={avatar_url || "/images/default-avatar.png"}
          name={display_name || username}
          mr={{ base: 0, md: 4 }}
          mb={{ base: 4, md: 0 }}
        />

        <VStack align="start" flex="1" spacing={2}>
          <Text fontWeight="bold" fontSize="xl">
            {display_name || username}
          </Text>
          <Text color="gray.500" fontSize="sm">
            @{username}
          </Text>

          {bio && (
            <Text color={textColor} fontSize="sm" noOfLines={2} mt={2}>
              {truncatedBio}
            </Text>
          )}

          <HStack spacing={8} mt={4} width="100%">
            <Stat size="sm">
              <StatLabel fontSize="xs">Recipes</StatLabel>
              <StatNumber fontSize="md">{recipes_count}</StatNumber>
            </Stat>

            <Stat size="sm">
              <StatLabel fontSize="xs">Followers</StatLabel>
              <StatNumber fontSize="md">{followersCount}</StatNumber>
            </Stat>
          </HStack>
        </VStack>

        {user && user.id !== id && (
          <Button
            colorScheme={following ? "gray" : "teal"}
            variant={following ? "outline" : "solid"}
            size="sm"
            onClick={handleFollowClick}
            ml={{ base: 0, md: 4 }}
            mt={{ base: 4, md: 0 }}
          >
            {following ? "Following" : "Follow"}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default UserCard;
