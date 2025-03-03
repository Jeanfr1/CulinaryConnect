"use client";

import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
  useColorModeValue,
  Button,
  IconButton,
  Flex,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from "@chakra-ui/icons";
import { useState, Fragment } from "react";
import { MealPlan, PlannedMeal, MealType } from "../../types/meal-planning";
import { format, startOfWeek, addDays } from "date-fns";

interface MealPlannerCalendarProps {
  mealPlan: MealPlan | null;
  onAddMeal: (date: string, mealType: MealType) => void;
  onEditMeal: (meal: PlannedMeal) => void;
  onDeleteMeal: (mealId: string) => void;
}

const mealTypes: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
];

const mealTypeColors: Record<MealType, string> = {
  breakfast: "blue",
  lunch: "green",
  dinner: "purple",
  snack: "orange",
  dessert: "pink",
};

export default function MealPlannerCalendar({
  mealPlan,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}: MealPlannerCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return mealPlan
      ? new Date(mealPlan.startDate)
      : startOfWeek(new Date(), { weekStartsOn: 0 });
  });

  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Generate the days of the week
  const weekDays = [...Array(7)].map((_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      dateString: format(date, "yyyy-MM-dd"),
    };
  });

  // Group meals by date and meal type
  const mealsByDay: Record<string, Record<MealType, PlannedMeal[]>> = {};

  if (mealPlan) {
    weekDays.forEach((day) => {
      mealsByDay[day.dateString] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        dessert: [],
      };
    });

    mealPlan.meals.forEach((meal) => {
      const mealDate = meal.date.split("T")[0]; // Extract just the date part
      if (mealsByDay[mealDate]) {
        mealsByDay[mealDate][meal.mealType].push(meal);
      }
    });
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleMealClick = (meal: PlannedMeal) => {
    setSelectedMeal(meal);
    onOpen();
  };

  const handleDeleteMeal = () => {
    if (selectedMeal) {
      onDeleteMeal(selectedMeal.id);
      onClose();
    }
  };

  const handleEditMeal = () => {
    if (selectedMeal) {
      onEditMeal(selectedMeal);
      onClose();
    }
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBgColor = useColorModeValue("gray.50", "gray.700");

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">
          {format(currentWeekStart, "MMMM d")} -{" "}
          {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
        </Heading>
        <HStack>
          <IconButton
            aria-label="Previous week"
            icon={<ChevronLeftIcon />}
            onClick={handlePreviousWeek}
          />
          <Button
            onClick={() =>
              setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))
            }
          >
            Today
          </Button>
          <IconButton
            aria-label="Next week"
            icon={<ChevronRightIcon />}
            onClick={handleNextWeek}
          />
        </HStack>
      </Flex>

      <Grid
        templateColumns="auto repeat(7, 1fr)"
        gap={1}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        {/* Empty cell in top-left corner */}
        <GridItem
          bg={headerBgColor}
          p={2}
          borderBottomWidth={1}
          borderRightWidth={1}
          borderColor={borderColor}
        >
          <Text fontWeight="bold" textAlign="center">
            Meal Type
          </Text>
        </GridItem>

        {/* Day headers */}
        {weekDays.map((day) => (
          <GridItem
            key={day.dateString}
            bg={headerBgColor}
            p={2}
            borderBottomWidth={1}
            borderRightWidth={1}
            borderColor={borderColor}
          >
            <VStack spacing={0}>
              <Text fontWeight="bold">{day.dayName}</Text>
              <Text fontSize="lg">{day.dayNumber}</Text>
            </VStack>
          </GridItem>
        ))}

        {/* Meal type rows */}
        {mealTypes.map((mealType) => (
          <Fragment key={mealType}>
            {/* Meal type header */}
            <GridItem
              bg={headerBgColor}
              p={2}
              borderBottomWidth={1}
              borderRightWidth={1}
              borderColor={borderColor}
            >
              <Text fontWeight="bold" textTransform="capitalize">
                {mealType}
              </Text>
            </GridItem>

            {/* Meal cells for each day */}
            {weekDays.map((day) => {
              const meals =
                mealPlan && mealsByDay[day.dateString]
                  ? mealsByDay[day.dateString][mealType]
                  : [];

              return (
                <GridItem
                  key={`${day.dateString}-${mealType}`}
                  bg={bgColor}
                  p={2}
                  borderBottomWidth={1}
                  borderRightWidth={1}
                  borderColor={borderColor}
                  minHeight="100px"
                  position="relative"
                >
                  {meals.length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {meals.map((meal) => (
                        <Box
                          key={meal.id}
                          p={2}
                          borderRadius="md"
                          bg={`${mealTypeColors[mealType]}.100`}
                          borderLeftWidth={4}
                          borderLeftColor={`${mealTypeColors[mealType]}.500`}
                          cursor="pointer"
                          onClick={() => handleMealClick(meal)}
                          _hover={{ bg: `${mealTypeColors[mealType]}.200` }}
                        >
                          <Text fontWeight="medium" noOfLines={1}>
                            {meal.recipe?.title || "Untitled Recipe"}
                          </Text>
                          {meal.servings > 1 && (
                            <Badge
                              colorScheme={mealTypeColors[mealType]}
                              mt={1}
                            >
                              {meal.servings} servings
                            </Badge>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Tooltip
                      label={`Add ${mealType} for ${format(
                        day.date,
                        "EEEE, MMMM d"
                      )}`}
                    >
                      <IconButton
                        aria-label={`Add ${mealType}`}
                        icon={<AddIcon />}
                        size="sm"
                        variant="ghost"
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        onClick={() => onAddMeal(day.dateString, mealType)}
                      />
                    </Tooltip>
                  )}
                </GridItem>
              );
            })}
          </Fragment>
        ))}
      </Grid>

      {/* Meal detail modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMeal?.recipe?.title || "Meal Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMeal && (
              <VStack align="start" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Date:</Text>
                  <Text>
                    {format(new Date(selectedMeal.date), "EEEE, MMMM d, yyyy")}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Meal Type:</Text>
                  <Badge colorScheme={mealTypeColors[selectedMeal.mealType]}>
                    {selectedMeal.mealType.charAt(0).toUpperCase() +
                      selectedMeal.mealType.slice(1)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Servings:</Text>
                  <Text>{selectedMeal.servings}</Text>
                </Box>
                {selectedMeal.notes && (
                  <Box>
                    <Text fontWeight="bold">Notes:</Text>
                    <Text>{selectedMeal.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteMeal}>
              Delete
            </Button>
            <Button colorScheme="brand" onClick={handleEditMeal}>
              Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
