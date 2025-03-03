"use client";

import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormErrorMessage,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { supabase } from "../../lib/supabase/client";
import MainLayout from "../../components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../lib/redux/hooks";
import { setUser } from "../../lib/redux/slices/userSlice";

export default function AuthPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toast = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
    setError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError) throw userError;

        // Set user in Redux store
        dispatch(setUser(userData));

        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        router.push("/");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    try {
      // Check if username is already taken
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

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          username,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;

        // Create user preferences
        const { error: preferencesError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: data.user.id,
          });

        if (preferencesError) throw preferencesError;

        // Create user stats
        const { error: statsError } = await supabase.from("user_stats").insert({
          user_id: data.user.id,
        });

        if (statsError) throw statsError;

        toast({
          title: "Account created",
          description: "Please check your email to confirm your account",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Switch to sign in tab
        setTabIndex(0);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up");
      toast({
        title: "Registration failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <Flex minH={"calc(100vh - 200px)"} align={"center"} justify={"center"}>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
            width={{ base: "sm", md: "md" }}
          >
            <Tabs
              isFitted
              variant="enclosed"
              index={tabIndex}
              onChange={handleTabsChange}
            >
              <TabList mb="1em">
                <Tab>Sign In</Tab>
                <Tab>Sign Up</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <form onSubmit={handleSignIn}>
                    <Stack spacing={4}>
                      <Heading fontSize={"2xl"}>
                        Sign in to your account
                      </Heading>
                      <FormControl id="email" isRequired isInvalid={!!error}>
                        <FormLabel>Email address</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </FormControl>
                      <FormControl id="password" isRequired isInvalid={!!error}>
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              icon={
                                showPassword ? <ViewOffIcon /> : <ViewIcon />
                              }
                              onClick={() => setShowPassword(!showPassword)}
                              variant="ghost"
                              size="sm"
                            />
                          </InputRightElement>
                        </InputGroup>
                        {error && <FormErrorMessage>{error}</FormErrorMessage>}
                      </FormControl>
                      <Button
                        colorScheme="brand"
                        type="submit"
                        isLoading={isLoading}
                      >
                        Sign in
                      </Button>
                    </Stack>
                  </form>
                </TabPanel>
                <TabPanel>
                  <form onSubmit={handleSignUp}>
                    <Stack spacing={4}>
                      <Heading fontSize={"2xl"}>Create a new account</Heading>
                      <FormControl id="signup-email" isRequired>
                        <FormLabel>Email address</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </FormControl>
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
                      <FormControl id="full-name">
                        <FormLabel>Full Name (optional)</FormLabel>
                        <Input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </FormControl>
                      <FormControl
                        id="signup-password"
                        isRequired
                        isInvalid={!!error && !error.includes("Username")}
                      >
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              icon={
                                showPassword ? <ViewOffIcon /> : <ViewIcon />
                              }
                              onClick={() => setShowPassword(!showPassword)}
                              variant="ghost"
                              size="sm"
                            />
                          </InputRightElement>
                        </InputGroup>
                        {error && !error.includes("Username") && (
                          <FormErrorMessage>{error}</FormErrorMessage>
                        )}
                      </FormControl>
                      <Button
                        colorScheme="brand"
                        type="submit"
                        isLoading={isLoading}
                      >
                        Sign up
                      </Button>
                    </Stack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Stack>
      </Flex>
    </MainLayout>
  );
}
