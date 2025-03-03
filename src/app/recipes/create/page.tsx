"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Flex,
  useToast,
  Image,
  IconButton,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import MainLayout from "../../../components/layout/MainLayout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  supabase,
  uploadFile,
  getPublicUrl,
} from "../../../lib/supabase/client";
import { useAppSelector } from "../../../lib/redux/hooks";

export default function CreateRecipePage() {
  return (
    <ProtectedRoute>
      <CreateRecipeContent />
    </ProtectedRoute>
  );
}

function CreateRecipeContent() {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.user.profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState("easy");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([{ description: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (
    index: number,
    field: "name" | "quantity" | "unit",
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (prepTime <= 0) newErrors.prepTime = "Prep time must be greater than 0";
    if (cookTime < 0) newErrors.cookTime = "Cook time cannot be negative";
    if (servings <= 0) newErrors.servings = "Servings must be greater than 0";

    // Validate ingredients
    let hasInvalidIngredient = false;
    ingredients.forEach((ingredient, index) => {
      if (!ingredient.name.trim()) {
        newErrors[`ingredient_${index}_name`] = "Ingredient name is required";
        hasInvalidIngredient = true;
      }
    });

    // Validate steps
    let hasInvalidStep = false;
    steps.forEach((step, index) => {
      if (!step.description.trim()) {
        newErrors[`step_${index}`] = "Step description is required";
        hasInvalidStep = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Process tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        const filePath = `${user?.id}/${Date.now()}-${imageFile.name}`;
        const uploadResult = await uploadFile(
          "recipe-images",
          filePath,
          imageFile
        );

        if (uploadResult) {
          imageUrl = getPublicUrl("recipe-images", filePath);
        }
      }

      // Create recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title,
          description,
          image_url: imageUrl,
          prep_time: prepTime,
          cook_time: cookTime,
          servings,
          difficulty,
          tags: tagArray,
          author_id: user?.id,
          is_public: isPublic,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Add ingredients
      const validIngredients = ingredients.filter(
        (ing) => ing.name.trim() !== ""
      );
      if (validIngredients.length > 0) {
        const ingredientsToInsert = validIngredients.map((ing) => ({
          recipe_id: recipeData.id,
          name: ing.name.trim(),
          quantity: parseFloat(ing.quantity) || null,
          unit: ing.unit.trim() || null,
        }));

        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;
      }

      // Add steps
      const validSteps = steps.filter((step) => step.description.trim() !== "");
      if (validSteps.length > 0) {
        const stepsToInsert = validSteps.map((step, index) => ({
          recipe_id: recipeData.id,
          step_number: index + 1,
          description: step.description.trim(),
        }));

        const { error: stepsError } = await supabase
          .from("recipe_steps")
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      toast({
        title: "Recipe Created",
        description: "Your recipe has been created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Navigate to the recipe page
      router.push(`/recipes/${recipeData.id}`);
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create recipe",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Container maxW="4xl" py={8}>
        <Heading as="h1" size="xl" mb={8}>
          Create New Recipe
        </Heading>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg={useColorModeValue("white", "gray.700")}
          p={6}
          borderRadius="lg"
          shadow="md"
        >
          <VStack spacing={6} align="stretch">
            {/* Basic Info */}
            <Heading as="h2" size="md">
              Basic Information
            </Heading>

            <FormControl isRequired isInvalid={!!errors.title}>
              <FormLabel>Recipe Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter recipe title"
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your recipe"
                rows={3}
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.prepTime}>
                <FormLabel>Prep Time (minutes)</FormLabel>
                <NumberInput
                  min={1}
                  value={prepTime}
                  onChange={(_, value) => setPrepTime(value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.prepTime}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.cookTime}>
                <FormLabel>Cook Time (minutes)</FormLabel>
                <NumberInput
                  min={0}
                  value={cookTime}
                  onChange={(_, value) => setCookTime(value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.cookTime}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.servings}>
                <FormLabel>Servings</FormLabel>
                <NumberInput
                  min={1}
                  value={servings}
                  onChange={(_, value) => setServings(value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.servings}</FormErrorMessage>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Difficulty</FormLabel>
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Tags (comma separated)</FormLabel>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. vegetarian, dinner, quick"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Recipe Image</FormLabel>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                colorScheme="gray"
                size="md"
                mb={4}
              >
                Select Image
              </Button>
              {imagePreview && (
                <Box mt={2}>
                  <Image
                    src={imagePreview}
                    alt="Recipe preview"
                    maxH="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </Box>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Visibility</FormLabel>
              <Select
                value={isPublic ? "public" : "private"}
                onChange={(e) => setIsPublic(e.target.value === "public")}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Select>
            </FormControl>

            <Divider my={4} />

            {/* Ingredients */}
            <Heading as="h2" size="md">
              Ingredients
            </Heading>

            {ingredients.map((ingredient, index) => (
              <HStack key={index} spacing={2} align="flex-end">
                <FormControl
                  isRequired
                  isInvalid={!!errors[`ingredient_${index}_name`]}
                >
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    placeholder="Ingredient name"
                  />
                  <FormErrorMessage>
                    {errors[`ingredient_${index}_name`]}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", e.target.value)
                    }
                    placeholder="Amount"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Unit</FormLabel>
                  <Input
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    placeholder="Unit"
                  />
                </FormControl>

                <IconButton
                  aria-label="Remove ingredient"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  variant="ghost"
                  isDisabled={ingredients.length === 1}
                  onClick={() => handleRemoveIngredient(index)}
                />
              </HStack>
            ))}

            <Button
              leftIcon={<AddIcon />}
              onClick={handleAddIngredient}
              colorScheme="brand"
              variant="outline"
              alignSelf="flex-start"
            >
              Add Ingredient
            </Button>

            <Divider my={4} />

            {/* Steps */}
            <Heading as="h2" size="md">
              Preparation Steps
            </Heading>

            {steps.map((step, index) => (
              <HStack key={index} spacing={2} align="flex-end">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  bg="brand.500"
                  color="white"
                  w="30px"
                  h="30px"
                  fontSize="sm"
                  fontWeight="bold"
                  mt={8}
                >
                  {index + 1}
                </Box>

                <FormControl isRequired isInvalid={!!errors[`step_${index}`]}>
                  <FormLabel>Step Description</FormLabel>
                  <Textarea
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder="Describe this step"
                  />
                  <FormErrorMessage>{errors[`step_${index}`]}</FormErrorMessage>
                </FormControl>

                <IconButton
                  aria-label="Remove step"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  variant="ghost"
                  isDisabled={steps.length === 1}
                  onClick={() => handleRemoveStep(index)}
                />
              </HStack>
            ))}

            <Button
              leftIcon={<AddIcon />}
              onClick={handleAddStep}
              colorScheme="brand"
              variant="outline"
              alignSelf="flex-start"
            >
              Add Step
            </Button>

            <Divider my={4} />

            <Flex justify="flex-end" mt={6}>
              <Button
                colorScheme="gray"
                mr={4}
                onClick={() => router.back()}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                Create Recipe
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Container>
    </MainLayout>
  );
}
