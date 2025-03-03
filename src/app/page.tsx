"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  VStack,
  HStack,
  Image,
  Badge,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import {
  FaUtensils,
  FaCalendarAlt,
  FaShoppingBasket,
  FaUsers,
} from "react-icons/fa";
import NextLink from "next/link";
import MainLayout from "../components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <Box
        as="section"
        bg="brand.600"
        color="white"
        py={20}
        px={4}
        borderRadius="lg"
        mb={10}
        backgroundImage="url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80')"
        backgroundSize="cover"
        backgroundPosition="center"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "rgba(37, 99, 235, 0.7)",
          borderRadius: "lg",
        }}
      >
        <Container maxW="container.xl" position="relative">
          <VStack spacing={6} align="flex-start" maxW="container.md">
            <Heading as="h1" size="3xl" fontWeight="bold">
              Discover, Cook, Share
            </Heading>
            <Text fontSize="xl">
              CulinaryConnect is your all-in-one platform for discovering
              delicious recipes, planning meals, and connecting with food
              enthusiasts around the world.
            </Text>
            <HStack spacing={4}>
              <Button
                as={NextLink}
                href="/recipes"
                size="lg"
                colorScheme="white"
                variant="outline"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Explore Recipes
              </Button>
              <Button
                as={NextLink}
                href="/auth"
                size="lg"
                bg="white"
                color="brand.600"
                _hover={{ bg: "gray.100" }}
              >
                Join Now
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box as="section" py={10}>
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={10} textAlign="center">
            Everything You Need in One Place
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <FeatureCard
              icon={FaUtensils}
              title="Recipe Repository"
              description="Discover thousands of recipes from around the world, with detailed instructions and nutritional information."
              href="/recipes"
            />
            <FeatureCard
              icon={FaCalendarAlt}
              title="Meal Planning"
              description="Plan your meals for the week with our intuitive drag-and-drop calendar interface."
              href="/meal-planning"
            />
            <FeatureCard
              icon={FaShoppingBasket}
              title="Grocery Lists"
              description="Automatically generate shopping lists based on your meal plans and never forget an ingredient again."
              href="/grocery-list"
            />
            <FeatureCard
              icon={FaUsers}
              title="Community"
              description="Connect with other food enthusiasts, share recipes, and get inspired by what others are cooking."
              href="/profile"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Recipes Section */}
      <Box
        as="section"
        py={10}
        bg={useColorModeValue("gray.50", "gray.900")}
        borderRadius="lg"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" mb={6}>
            <Heading as="h2" size="xl">
              Featured Recipes
            </Heading>
            <Button
              as={NextLink}
              href="/recipes"
              colorScheme="brand"
              variant="outline"
            >
              View All
            </Button>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {/* These would be replaced with actual recipe data */}
            <RecipePreview
              title="Creamy Garlic Parmesan Pasta"
              image="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
              time="30 min"
              difficulty="easy"
              href="/recipes/1"
            />
            <RecipePreview
              title="Spicy Thai Basil Chicken"
              image="https://images.unsplash.com/photo-1562967916-eb82221dfb92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80"
              time="25 min"
              difficulty="medium"
              href="/recipes/2"
            />
            <RecipePreview
              title="Classic Chocolate Chip Cookies"
              image="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              time="45 min"
              difficulty="easy"
              href="/recipes/3"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box as="section" py={20} textAlign="center">
        <Container maxW="container.md">
          <Heading as="h2" size="xl" mb={4}>
            Ready to Transform Your Cooking Experience?
          </Heading>
          <Text
            fontSize="lg"
            mb={8}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Join thousands of food enthusiasts who are discovering new recipes,
            planning meals, and connecting with others on CulinaryConnect.
          </Text>
          <Button
            as={NextLink}
            href="/auth"
            size="lg"
            colorScheme="brand"
            px={8}
            fontSize="md"
          >
            Sign Up for Free
          </Button>
        </Container>
      </Box>
    </MainLayout>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  return (
    <VStack
      as={NextLink}
      href={href}
      align="flex-start"
      p={6}
      bg={useColorModeValue("white", "gray.800")}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
        borderColor: "brand.500",
        textDecoration: "none",
      }}
      spacing={4}
    >
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        borderRadius="full"
        bg="brand.500"
        color="white"
      >
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Heading as="h3" size="md">
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.400")}>
        {description}
      </Text>
    </VStack>
  );
}

interface RecipePreviewProps {
  title: string;
  image: string;
  time: string;
  difficulty: "easy" | "medium" | "hard";
  href: string;
}

function RecipePreview({
  title,
  image,
  time,
  difficulty,
  href,
}: RecipePreviewProps) {
  const difficultyColor = {
    easy: "green",
    medium: "orange",
    hard: "red",
  }[difficulty];

  return (
    <Box
      as={NextLink}
      href={href}
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue("white", "gray.800")}
      borderWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
        textDecoration: "none",
      }}
    >
      <Box h="200px" position="relative">
        <Image
          src={image}
          alt={title}
          objectFit="cover"
          w="100%"
          h="100%"
          fallbackSrc="https://via.placeholder.com/300x200?text=Recipe+Image"
        />
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={difficultyColor}
          borderRadius="full"
          px={2}
          py={1}
        >
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
      </Box>
      <Box p={4}>
        <Heading as="h3" size="md" mb={2} noOfLines={1}>
          {title}
        </Heading>
        <Text color={useColorModeValue("gray.600", "gray.400")}>{time}</Text>
      </Box>
    </Box>
  );
}
