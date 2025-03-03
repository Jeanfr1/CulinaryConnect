"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Avatar,
  AvatarBadge,
  IconButton,
  Center,
  useColorModeValue,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  FormErrorMessage,
  Spinner,
  Select,
  Checkbox,
  CheckboxGroup,
  VStack,
} from "@chakra-ui/react";
import { SmallCloseIcon, EditIcon } from "@chakra-ui/icons";
import MainLayout from "../../components/layout/MainLayout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "../../lib/redux/hooks";
import {
  updateUserProfile,
  updateUserPreferences,
} from "../../lib/redux/slices/userSlice";
import { supabase, uploadFile, getPublicUrl } from "../../lib/supabase/client";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const userProfile = useAppSelector((state) => state.user.profile);
  const userPreferences = useAppSelector((state) => state.user.preferences);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Preferences state
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || "");
      setFullName(userProfile.full_name || "");
      setAvatarUrl(userProfile.avatar_url || "");
    }

    if (userPreferences) {
      setDietaryRestrictions(userPreferences.dietary_restrictions || []);
      setFavoriteCuisines(userPreferences.favorite_cuisines || []);
      setEmailNotifications(
        userPreferences.notification_preferences?.email || false
      );
      setPushNotifications(
        userPreferences.notification_preferences?.push || false
      );
    }
  }, [userProfile, userPreferences]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Check if username is already taken (if changed)
      if (username !== userProfile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("username")
          .eq("username", username)
          .single();

        if (existingUser) {
          setError("Username is already taken");
          setIsLoading(false);
          return;
        }
      }

      let updatedAvatarUrl = userProfile?.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const filePath = `${userProfile?.id}/${Date.now()}-${avatarFile.name}`;
        const uploadResult = await uploadFile("avatars", filePath, avatarFile);

        if (uploadResult) {
          updatedAvatarUrl = getPublicUrl("avatars", filePath);
        }
      }

      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username,
          full_name: fullName,
          avatar_url: updatedAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userProfile?.id);

      if (updateError) throw updateError;

      // Update Redux state
      dispatch(
        updateUserProfile({
          username,
          full_name: fullName,
          avatar_url: updatedAvatarUrl,
        })
      );

      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setError(error.message || "An error occurred while updating profile");
      toast({
        title: "Error updating profile",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Update user preferences in Supabase
      const { error: updateError } = await supabase
        .from("user_preferences")
        .update({
          dietary_restrictions: dietaryRestrictions,
          favorite_cuisines: favoriteCuisines,
          notification_preferences: {
            email: emailNotifications,
            push: pushNotifications,
          },
        })
        .eq("user_id", userProfile?.id);

      if (updateError) throw updateError;

      // Update Redux state
      dispatch(
        updateUserPreferences({
          dietary_restrictions: dietaryRestrictions,
          favorite_cuisines: favoriteCuisines,
          notification_preferences: {
            email: emailNotifications,
            push: pushNotifications,
          },
        })
      );

      toast({
        title: "Preferences updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setError(error.message || "An error occurred while updating preferences");
      toast({
        title: "Error updating preferences",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) {
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

  return (
    <MainLayout>
      <Flex
        minH={"calc(100vh - 200px)"}
        align={"center"}
        justify={"center"}
        py={12}
      >
        <Box
          maxW={"lg"}
          w={"full"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          rounded={"lg"}
          p={6}
        >
          <Heading as="h1" size="xl" mb={6} textAlign="center">
            Your Profile
          </Heading>

          <Tabs isFitted colorScheme="brand" mb={4}>
            <TabList>
              <Tab>Profile</Tab>
              <Tab>Preferences</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Stack spacing={4}>
                  <Flex justify="center">
                    <Box position="relative">
                      <Avatar
                        size="2xl"
                        src={avatarUrl}
                        name={fullName || username}
                      >
                        <AvatarBadge
                          as={IconButton}
                          size="sm"
                          rounded="full"
                          top="-10px"
                          colorScheme="brand"
                          aria-label="Edit avatar"
                          icon={<EditIcon />}
                          onClick={() => fileInputRef.current?.click()}
                        />
                      </Avatar>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                        accept="image/*"
                      />
                    </Box>
                  </Flex>

                  <FormControl
                    id="username"
                    isRequired
                    isInvalid={!!error && error.includes("Username")}
                  >
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {error && error.includes("Username") && (
                      <FormErrorMessage>{error}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl id="fullName">
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </FormControl>

                  <Button
                    colorScheme="brand"
                    onClick={handleProfileUpdate}
                    isLoading={isLoading}
                    mt={4}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </TabPanel>

              <TabPanel>
                <Stack spacing={6}>
                  <FormControl id="dietary-restrictions">
                    <FormLabel>Dietary Restrictions</FormLabel>
                    <CheckboxGroup
                      colorScheme="brand"
                      value={dietaryRestrictions}
                      onChange={(values) =>
                        setDietaryRestrictions(values as string[])
                      }
                    >
                      <VStack align="start" spacing={2}>
                        <Checkbox value="vegetarian">Vegetarian</Checkbox>
                        <Checkbox value="vegan">Vegan</Checkbox>
                        <Checkbox value="gluten-free">Gluten-Free</Checkbox>
                        <Checkbox value="dairy-free">Dairy-Free</Checkbox>
                        <Checkbox value="nut-free">Nut-Free</Checkbox>
                        <Checkbox value="low-carb">Low-Carb</Checkbox>
                      </VStack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl id="favorite-cuisines">
                    <FormLabel>Favorite Cuisines</FormLabel>
                    <Select
                      placeholder="Add a cuisine"
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !favoriteCuisines.includes(e.target.value)
                        ) {
                          setFavoriteCuisines([
                            ...favoriteCuisines,
                            e.target.value,
                          ]);
                        }
                      }}
                    >
                      {[
                        "Italian",
                        "Mexican",
                        "Chinese",
                        "Japanese",
                        "Indian",
                        "Thai",
                        "French",
                        "Mediterranean",
                        "American",
                        "Middle Eastern",
                      ]
                        .filter(
                          (cuisine) => !favoriteCuisines.includes(cuisine)
                        )
                        .map((cuisine) => (
                          <option key={cuisine} value={cuisine}>
                            {cuisine}
                          </option>
                        ))}
                    </Select>

                    <Box mt={2}>
                      {favoriteCuisines.map((cuisine) => (
                        <Button
                          key={cuisine}
                          size="sm"
                          m={1}
                          rightIcon={<SmallCloseIcon />}
                          onClick={() =>
                            setFavoriteCuisines(
                              favoriteCuisines.filter((c) => c !== cuisine)
                            )
                          }
                        >
                          {cuisine}
                        </Button>
                      ))}
                    </Box>
                  </FormControl>

                  <FormControl id="notification-preferences">
                    <FormLabel>Notification Preferences</FormLabel>
                    <Stack spacing={2}>
                      <Checkbox
                        colorScheme="brand"
                        isChecked={emailNotifications}
                        onChange={(e) =>
                          setEmailNotifications(e.target.checked)
                        }
                      >
                        Email Notifications
                      </Checkbox>
                      <Checkbox
                        colorScheme="brand"
                        isChecked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                      >
                        Push Notifications
                      </Checkbox>
                    </Stack>
                  </FormControl>

                  <Button
                    colorScheme="brand"
                    onClick={handlePreferencesUpdate}
                    isLoading={isLoading}
                    mt={4}
                  >
                    Save Preferences
                  </Button>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </MainLayout>
  );
}
