"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
} from "@chakra-ui/react";
import {
  AddIcon,
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { supabase } from "../../lib/supabase/client";
import { useAppSelector } from "../../lib/redux/hooks";

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  user_id: string;
  created_at: string;
}

interface MealPlanDay {
  id: string;
  meal_plan_id: string;
  day_date: string;
  day_name: string;
}

interface MealPlanMeal {
  id: string;
  meal_plan_day_id: string;
  recipe_id: string | null;
  meal_type: string;
  notes: string | null;
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
  } | null;
}

export default function MealPlanningPage() {
  return (
    <ProtectedRoute>
      <MealPlanningContent />
    </ProtectedRoute>
  );
}

function MealPlanningContent() {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.user.profile);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanStartDate, setNewPlanStartDate] = useState("");
  const [newPlanEndDate, setNewPlanEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMealPlans();
    }
  }, [user]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMealPlans(data || []);
    } catch (error: any) {
      console.error("Error fetching meal plans:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load meal plans",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanTitle || !newPlanStartDate || !newPlanEndDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create new meal plan
      const { data: planData, error: planError } = await supabase
        .from("meal_plans")
        .insert({
          title: newPlanTitle,
          description: newPlanDescription || null,
          start_date: newPlanStartDate,
          end_date: newPlanEndDate,
          user_id: user?.id,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Generate days for the meal plan
      const startDate = new Date(newPlanStartDate);
      const endDate = new Date(newPlanEndDate);
      const dayDiff =
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      const days = [];
      for (let i = 0; i < dayDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const dayName = currentDate.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const formattedDate = currentDate.toISOString().split("T")[0];

        days.push({
          meal_plan_id: planData.id,
          day_date: formattedDate,
          day_name: dayName,
        });
      }

      // Insert days
      const { error: daysError } = await supabase
        .from("meal_plan_days")
        .insert(days);

      if (daysError) throw daysError;

      // Reset form
      setNewPlanTitle("");
      setNewPlanDescription("");
      setNewPlanStartDate("");
      setNewPlanEndDate("");
      onClose();

      // Refresh meal plans
      fetchMealPlans();

      toast({
        title: "Success",
        description: "Meal plan created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error creating meal plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create meal plan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from("meal_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      setMealPlans(mealPlans.filter((plan) => plan.id !== planId));

      toast({
        title: "Success",
        description: "Meal plan deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error deleting meal plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete meal plan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
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
      <Container maxW="6xl" py={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Heading as="h1" size="xl">
            Meal Planning
          </Heading>
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onOpen}>
            Create Meal Plan
          </Button>
        </Flex>

        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {mealPlans.length === 0 ? (
          <Box
            p={10}
            borderWidth="1px"
            borderRadius="lg"
            textAlign="center"
            bg={useColorModeValue("white", "gray.700")}
          >
            <Text fontSize="lg" mb={4}>
              You don't have any meal plans yet.
            </Text>
            <Button colorScheme="brand" onClick={onOpen}>
              Create Your First Meal Plan
            </Button>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {mealPlans.map((plan) => (
              <Card
                key={plan.id}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                bg={useColorModeValue("white", "gray.700")}
                _hover={{
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s",
                }}
              >
                <CardHeader pb={0}>
                  <Flex justify="space-between" align="start">
                    <Heading size="md" noOfLines={2}>
                      {plan.title}
                    </Heading>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        size="sm"
                        aria-label="Options"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() =>
                            router.push(`/meal-planning/${plan.id}`)
                          }
                        >
                          Edit Plan
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          color="red.500"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          Delete Plan
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </CardHeader>

                <CardBody>
                  {plan.description && (
                    <Text fontSize="sm" color="gray.500" noOfLines={2} mb={3}>
                      {plan.description}
                    </Text>
                  )}
                  <HStack spacing={2} mb={3}>
                    <Badge colorScheme="green">
                      {formatDate(plan.start_date)}
                    </Badge>
                    <Text fontSize="sm">to</Text>
                    <Badge colorScheme="green">
                      {formatDate(plan.end_date)}
                    </Badge>
                  </HStack>
                </CardBody>

                <CardFooter pt={0}>
                  <Button
                    variant="solid"
                    colorScheme="brand"
                    size="sm"
                    width="full"
                    onClick={() => router.push(`/meal-planning/${plan.id}`)}
                  >
                    View Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </Grid>
        )}

        {/* Create Meal Plan Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Meal Plan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    placeholder="Weekly Meal Plan"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    placeholder="A balanced meal plan for the week"
                    value={newPlanDescription}
                    onChange={(e) => setNewPlanDescription(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={newPlanStartDate}
                    onChange={(e) => setNewPlanStartDate(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    value={newPlanEndDate}
                    onChange={(e) => setNewPlanEndDate(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleCreatePlan}
                isLoading={isSubmitting}
              >
                Create Plan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </MainLayout>
  );
}
