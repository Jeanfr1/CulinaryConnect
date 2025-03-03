"use client";

import {
  Box,
  Container,
  Stack,
  Text,
  Image,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  List,
  ListItem,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import {
  FaClock,
  FaUtensils,
  FaHeart,
  FaRegHeart,
  FaPrint,
  FaShare,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import { Recipe, Ingredient, RecipeStep } from "../../types/recipe";
import { useState } from "react";

interface RecipeDetailProps {
  recipe: Recipe;
  onLike?: () => void;
  onSave?: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function RecipeDetail({
  recipe,
  onLike,
  onSave,
  isLiked = false,
  isSaved = false,
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings);
  const servingRatio = servings / recipe.servings;

  const {
    title,
    description,
    imageUrl,
    prepTime,
    cookTime,
    difficulty,
    tags,
    ingredients,
    steps,
    nutrition,
    likes,
    authorId,
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
    <Container maxW={"7xl"}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 6, md: 12 }}
      >
        <Flex>
          <Image
            rounded={"md"}
            alt={title}
            src={imageUrl}
            fit={"cover"}
            align={"center"}
            w={"100%"}
            h={{ base: "100%", sm: "400px", lg: "500px" }}
          />
        </Flex>
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              {title}
            </Heading>
            <HStack mt={2} spacing={2}>
              <Badge colorScheme={difficultyColor} fontSize="sm" px={2} py={1}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  colorScheme="brand"
                  fontSize="sm"
                  px={2}
                  py={1}
                >
                  {tag}
                </Badge>
              ))}
            </HStack>
            <Text
              color={useColorModeValue("gray.600", "gray.400")}
              fontSize={"lg"}
              mt={4}
            >
              {description}
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.200", "gray.600")}
              />
            }
          >
            <HStack spacing={10}>
              <Box>
                <Text
                  fontSize={"md"}
                  fontWeight={"500"}
                  color={useColorModeValue("gray.600", "gray.400")}
                >
                  Prep Time
                </Text>
                <Flex align="center" mt={1}>
                  <Icon as={FaClock} color="gray.500" mr={1} />
                  <Text fontWeight={"500"}>{prepTime} min</Text>
                </Flex>
              </Box>
              <Box>
                <Text
                  fontSize={"md"}
                  fontWeight={"500"}
                  color={useColorModeValue("gray.600", "gray.400")}
                >
                  Cook Time
                </Text>
                <Flex align="center" mt={1}>
                  <Icon as={FaClock} color="gray.500" mr={1} />
                  <Text fontWeight={"500"}>{cookTime} min</Text>
                </Flex>
              </Box>
              <Box>
                <Text
                  fontSize={"md"}
                  fontWeight={"500"}
                  color={useColorModeValue("gray.600", "gray.400")}
                >
                  Total Time
                </Text>
                <Flex align="center" mt={1}>
                  <Icon as={FaClock} color="gray.500" mr={1} />
                  <Text fontWeight={"500"}>{formattedTime}</Text>
                </Flex>
              </Box>
            </HStack>

            <Box>
              <Flex justify="space-between" align="center">
                <Text
                  fontSize={"xl"}
                  fontWeight={"500"}
                  color={useColorModeValue("gray.900", "gray.400")}
                >
                  Ingredients
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    isDisabled={servings <= 1}
                  >
                    -
                  </Button>
                  <Text fontWeight="medium">{servings} servings</Text>
                  <Button size="sm" onClick={() => setServings(servings + 1)}>
                    +
                  </Button>
                </HStack>
              </Flex>
              <List spacing={2} mt={4}>
                {ingredients.map((ingredient) => (
                  <ListItem key={ingredient.id}>
                    <Flex align="baseline">
                      <Text as="span" fontWeight={"bold"} mr={2}>
                        {(ingredient.quantity * servingRatio).toFixed(
                          Number.isInteger(ingredient.quantity * servingRatio)
                            ? 0
                            : 1
                        )}{" "}
                        {ingredient.unit}
                      </Text>
                      <Text as="span">{ingredient.name}</Text>
                      {ingredient.notes && (
                        <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                          ({ingredient.notes})
                        </Text>
                      )}
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Text
                fontSize={"xl"}
                fontWeight={"500"}
                color={useColorModeValue("gray.900", "gray.400")}
              >
                Instructions
              </Text>
              <List spacing={4} mt={4}>
                {steps.map((step) => (
                  <ListItem key={step.id}>
                    <Flex>
                      <Text
                        as="span"
                        fontWeight={"bold"}
                        fontSize="lg"
                        color="brand.600"
                        mr={4}
                      >
                        {step.stepNumber}.
                      </Text>
                      <Text>{step.description}</Text>
                    </Flex>
                    {step.imageUrl && (
                      <Image
                        src={step.imageUrl}
                        alt={`Step ${step.stepNumber}`}
                        mt={2}
                        borderRadius="md"
                        maxH="200px"
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>

            {nutrition && (
              <Box>
                <Text
                  fontSize={"xl"}
                  fontWeight={"500"}
                  color={useColorModeValue("gray.900", "gray.400")}
                  mb={4}
                >
                  Nutrition Information
                </Text>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Calories</Th>
                      <Th>Protein</Th>
                      <Th>Carbs</Th>
                      <Th>Fat</Th>
                      {nutrition.fiber !== undefined && <Th>Fiber</Th>}
                      {nutrition.sugar !== undefined && <Th>Sugar</Th>}
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>
                        {Math.round(nutrition.calories * servingRatio)} kcal
                      </Td>
                      <Td>{Math.round(nutrition.protein * servingRatio)}g</Td>
                      <Td>{Math.round(nutrition.carbs * servingRatio)}g</Td>
                      <Td>{Math.round(nutrition.fat * servingRatio)}g</Td>
                      {nutrition.fiber !== undefined && (
                        <Td>{Math.round(nutrition.fiber * servingRatio)}g</Td>
                      )}
                      {nutrition.sugar !== undefined && (
                        <Td>{Math.round(nutrition.sugar * servingRatio)}g</Td>
                      )}
                    </Tr>
                  </Tbody>
                </Table>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  * Nutrition information is per serving
                </Text>
              </Box>
            )}
          </Stack>

          <Divider />

          <HStack spacing={4}>
            <Button
              leftIcon={isLiked ? <FaHeart /> : <FaRegHeart />}
              colorScheme={isLiked ? "red" : "gray"}
              variant={isLiked ? "solid" : "outline"}
              onClick={onLike}
            >
              {likes} {likes === 1 ? "Like" : "Likes"}
            </Button>
            <Button
              leftIcon={isSaved ? <FaBookmark /> : <FaRegBookmark />}
              colorScheme={isSaved ? "brand" : "gray"}
              variant={isSaved ? "solid" : "outline"}
              onClick={onSave}
            >
              {isSaved ? "Saved" : "Save"}
            </Button>
            <IconButton
              icon={<FaPrint />}
              aria-label="Print recipe"
              variant="outline"
              onClick={() => window.print()}
            />
            <IconButton
              icon={<FaShare />}
              aria-label="Share recipe"
              variant="outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: recipe.title,
                    text: recipe.description,
                    url: window.location.href,
                  });
                }
              }}
            />
          </HStack>
        </Stack>
      </SimpleGrid>
    </Container>
  );
}
