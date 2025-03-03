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
  Checkbox,
  CheckboxGroup,
  Stack,
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

interface GroceryList {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  is_completed: boolean;
}

interface GroceryItem {
  id: string;
  grocery_list_id: string;
  name: string;
  quantity: string;
  category: string;
  is_checked: boolean;
}

export default function GroceryListPage() {
  return (
    <ProtectedRoute>
      <GroceryListContent />
    </ProtectedRoute>
  );
}

function GroceryListContent() {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.user.profile);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isItemModalOpen,
    onOpen: onItemModalOpen,
    onClose: onItemModalClose,
  } = useDisclosure();

  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [activeList, setActiveList] = useState<GroceryList | null>(null);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newListTitle, setNewListTitle] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("produce");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "produce", label: "Produce" },
    { value: "dairy", label: "Dairy" },
    { value: "meat", label: "Meat & Seafood" },
    { value: "bakery", label: "Bakery" },
    { value: "pantry", label: "Pantry" },
    { value: "frozen", label: "Frozen" },
    { value: "beverages", label: "Beverages" },
    { value: "household", label: "Household" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    if (user) {
      fetchGroceryLists();
    }
  }, [user]);

  useEffect(() => {
    if (activeList) {
      fetchGroceryItems();
    }
  }, [activeList]);

  const fetchGroceryLists = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGroceryLists(data || []);

      // Set active list to the first non-completed list, or the first list if all are completed
      if (data && data.length > 0) {
        const nonCompletedList = data.find((list) => !list.is_completed);
        setActiveList(nonCompletedList || data[0]);
      }
    } catch (error: any) {
      console.error("Error fetching grocery lists:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load grocery lists",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroceryItems = async () => {
    if (!activeList) return;

    try {
      const { data, error } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("grocery_list_id", activeList.id)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      setGroceryItems(data || []);
    } catch (error: any) {
      console.error("Error fetching grocery items:", error);
      toast({
        title: "Error",
        description: "Failed to load grocery items",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateList = async () => {
    if (!newListTitle) {
      toast({
        title: "Missing information",
        description: "Please enter a title for your grocery list",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("grocery_lists")
        .insert({
          title: newListTitle,
          description: newListDescription || null,
          user_id: user?.id,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      setGroceryLists([data, ...groceryLists]);
      setActiveList(data);
      setNewListTitle("");
      setNewListDescription("");
      onClose();

      toast({
        title: "Success",
        description: "Grocery list created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error creating grocery list:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create grocery list",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !activeList) {
      toast({
        title: "Missing information",
        description: "Please enter an item name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("grocery_items")
        .insert({
          grocery_list_id: activeList.id,
          name: newItemName,
          quantity: newItemQuantity || "1",
          category: newItemCategory,
          is_checked: false,
        })
        .select()
        .single();

      if (error) throw error;

      setGroceryItems([...groceryItems, data]);
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemCategory("produce");
      onItemModalClose();

      toast({
        title: "Success",
        description: "Item added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error adding grocery item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleItem = async (item: GroceryItem) => {
    try {
      const { error } = await supabase
        .from("grocery_items")
        .update({ is_checked: !item.is_checked })
        .eq("id", item.id);

      if (error) throw error;

      setGroceryItems(
        groceryItems.map((i) =>
          i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
        )
      );
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("grocery_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setGroceryItems(groceryItems.filter((item) => item.id !== itemId));

      toast({
        title: "Success",
        description: "Item removed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from("grocery_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      const updatedLists = groceryLists.filter((list) => list.id !== listId);
      setGroceryLists(updatedLists);

      if (activeList && activeList.id === listId) {
        setActiveList(updatedLists.length > 0 ? updatedLists[0] : null);
      }

      toast({
        title: "Success",
        description: "Grocery list deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error deleting grocery list:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete grocery list",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleListCompletion = async () => {
    if (!activeList) return;

    try {
      const newStatus = !activeList.is_completed;

      const { error } = await supabase
        .from("grocery_lists")
        .update({ is_completed: newStatus })
        .eq("id", activeList.id);

      if (error) throw error;

      setActiveList({ ...activeList, is_completed: newStatus });
      setGroceryLists(
        groceryLists.map((list) =>
          list.id === activeList.id
            ? { ...list, is_completed: newStatus }
            : list
        )
      );

      toast({
        title: "Success",
        description: `List marked as ${newStatus ? "completed" : "active"}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error updating list status:", error);
      toast({
        title: "Error",
        description: "Failed to update list status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const groupItemsByCategory = () => {
    const grouped: Record<string, GroceryItem[]> = {};

    groceryItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return grouped;
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  if (loading && groceryLists.length === 0) {
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
            Grocery Lists
          </Heading>
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onOpen}>
            Create List
          </Button>
        </Flex>

        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {groceryLists.length === 0 ? (
          <Box
            p={10}
            borderWidth="1px"
            borderRadius="lg"
            textAlign="center"
            bg={useColorModeValue("white", "gray.700")}
          >
            <Text fontSize="lg" mb={4}>
              You don't have any grocery lists yet.
            </Text>
            <Button colorScheme="brand" onClick={onOpen}>
              Create Your First Grocery List
            </Button>
          </Box>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap={8}>
            {/* Lists Sidebar */}
            <Box>
              <VStack spacing={4} align="stretch">
                {groceryLists.map((list) => (
                  <Card
                    key={list.id}
                    borderRadius="md"
                    boxShadow="sm"
                    bg={
                      activeList?.id === list.id
                        ? "brand.50"
                        : useColorModeValue("white", "gray.700")
                    }
                    borderWidth={activeList?.id === list.id ? "2px" : "1px"}
                    borderColor={
                      activeList?.id === list.id ? "brand.500" : "transparent"
                    }
                    _hover={{ boxShadow: "md" }}
                    cursor="pointer"
                    onClick={() => setActiveList(list)}
                  >
                    <CardBody py={3}>
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                          <Text
                            fontWeight="medium"
                            textDecoration={
                              list.is_completed ? "line-through" : "none"
                            }
                            color={list.is_completed ? "gray.500" : "inherit"}
                          >
                            {list.title}
                          </Text>
                          {list.is_completed && (
                            <Badge colorScheme="green" size="sm">
                              Completed
                            </Badge>
                          )}
                        </VStack>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<ChevronDownIcon />}
                            variant="ghost"
                            size="sm"
                            aria-label="Options"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <MenuList>
                            <MenuItem
                              icon={<DeleteIcon />}
                              color="red.500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list.id);
                              }}
                            >
                              Delete List
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>

            {/* Active List Content */}
            {activeList ? (
              <Box
                bg={useColorModeValue("white", "gray.700")}
                borderRadius="lg"
                boxShadow="md"
                p={6}
              >
                <Flex justify="space-between" align="center" mb={6}>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">{activeList.title}</Heading>
                    {activeList.description && (
                      <Text color="gray.500">{activeList.description}</Text>
                    )}
                  </VStack>
                  <HStack>
                    <Button
                      colorScheme={activeList.is_completed ? "gray" : "green"}
                      size="sm"
                      onClick={handleToggleListCompletion}
                    >
                      {activeList.is_completed
                        ? "Mark as Active"
                        : "Mark as Completed"}
                    </Button>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="brand"
                      size="sm"
                      onClick={onItemModalOpen}
                    >
                      Add Item
                    </Button>
                  </HStack>
                </Flex>

                <Divider mb={6} />

                {groceryItems.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Text fontSize="lg" mb={4}>
                      This list is empty.
                    </Text>
                    <Button colorScheme="brand" onClick={onItemModalOpen}>
                      Add Your First Item
                    </Button>
                  </Box>
                ) : (
                  <VStack spacing={6} align="stretch">
                    {Object.entries(groupItemsByCategory()).map(
                      ([category, items]) => (
                        <Box key={category}>
                          <Heading size="md" mb={3}>
                            {getCategoryLabel(category)}
                          </Heading>
                          <VStack align="stretch" spacing={2}>
                            {items.map((item) => (
                              <Flex
                                key={item.id}
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                justify="space-between"
                                align="center"
                                bg={useColorModeValue("gray.50", "gray.700")}
                              >
                                <HStack>
                                  <Checkbox
                                    isChecked={item.is_checked}
                                    onChange={() => handleToggleItem(item)}
                                    colorScheme="brand"
                                  />
                                  <Text
                                    textDecoration={
                                      item.is_checked ? "line-through" : "none"
                                    }
                                    color={
                                      item.is_checked ? "gray.500" : "inherit"
                                    }
                                  >
                                    {item.name}
                                    {item.quantity && ` (${item.quantity})`}
                                  </Text>
                                </HStack>
                                <IconButton
                                  aria-label="Delete item"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteItem(item.id)}
                                />
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                      )
                    )}
                  </VStack>
                )}
              </Box>
            ) : (
              <Box
                bg={useColorModeValue("white", "gray.700")}
                borderRadius="lg"
                boxShadow="md"
                p={6}
                textAlign="center"
              >
                <Text fontSize="lg">
                  Select a list or create a new one to get started.
                </Text>
              </Box>
            )}
          </Grid>
        )}

        {/* Create List Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Grocery List</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    placeholder="Weekly Groceries"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    placeholder="Items for the week"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
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
                onClick={handleCreateList}
                isLoading={isSubmitting}
              >
                Create List
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Item Modal */}
        <Modal isOpen={isItemModalOpen} onClose={onItemModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Item Name</FormLabel>
                  <Input
                    placeholder="Apples"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Quantity (Optional)</FormLabel>
                  <Input
                    placeholder="2 lbs"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onItemModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleAddItem}
                isLoading={isSubmitting}
              >
                Add Item
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </MainLayout>
  );
}
