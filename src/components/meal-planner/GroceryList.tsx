"use client";

import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Checkbox,
  Input,
  Button,
  IconButton,
  Divider,
  useColorModeValue,
  Flex,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import {
  GroceryList as GroceryListType,
  GroceryItem,
} from "../../types/meal-planning";

interface GroceryListProps {
  groceryList: GroceryListType;
  onUpdateItem: (itemId: string, isChecked: boolean) => void;
  onAddItem: (item: Omit<GroceryItem, "id">) => void;
  onDeleteItem: (itemId: string) => void;
  onClearChecked: () => void;
}

// Common grocery categories
const categories = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Condiments",
  "Spices",
  "Other",
];

export default function GroceryList({
  groceryList,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onClearChecked,
}: GroceryListProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Other");
  const [groupByCategory, setGroupByCategory] = useState(true);

  // Group items by category
  const itemsByCategory: Record<string, GroceryItem[]> = {};

  if (groupByCategory) {
    groceryList.items.forEach((item) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
  }

  const handleAddItem = () => {
    if (newItemName.trim() === "") return;

    onAddItem({
      name: newItemName.trim(),
      quantity: parseFloat(newItemQuantity) || 1,
      unit: newItemUnit.trim(),
      category: newItemCategory,
      isChecked: false,
      groceryListId: groceryList.id,
    });

    // Reset form
    setNewItemName("");
    setNewItemQuantity("1");
    setNewItemUnit("");
  };

  const handleToggleItem = (itemId: string, isChecked: boolean) => {
    onUpdateItem(itemId, isChecked);
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="md">{groceryList.name}</Heading>
          <HStack>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={onClearChecked}
            >
              Clear Checked
            </Button>
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                {groupByCategory ? "By Category" : "All Items"}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setGroupByCategory(true)}>
                  Group by Category
                </MenuItem>
                <MenuItem onClick={() => setGroupByCategory(false)}>
                  Show All Items
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        <Divider />

        {/* Add new item form */}
        <HStack>
          <Input
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            flex={3}
          />
          <Input
            placeholder="Qty"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            type="number"
            min="0"
            step="0.1"
            flex={1}
          />
          <Input
            placeholder="Unit"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            flex={1}
          />
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {newItemCategory}
            </MenuButton>
            <MenuList maxH="200px" overflowY="auto">
              {categories.map((category) => (
                <MenuItem
                  key={category}
                  onClick={() => setNewItemCategory(category)}
                >
                  {category}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <IconButton
            aria-label="Add item"
            icon={<AddIcon />}
            colorScheme="brand"
            onClick={handleAddItem}
          />
        </HStack>

        <Divider />

        {/* Grocery items */}
        {groupByCategory ? (
          <Accordion
            allowMultiple
            defaultIndex={Object.keys(itemsByCategory).map((_, i) => i)}
          >
            {Object.entries(itemsByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, items]) => (
                <AccordionItem key={category} border="none">
                  <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm">{category}</Heading>
                    </Box>
                    <Badge colorScheme="brand" mr={2}>
                      {items.length}
                    </Badge>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={0}>
                    <VStack align="stretch" spacing={2}>
                      {items
                        .sort((a, b) => {
                          // Sort by checked status first, then by name
                          if (a.isChecked !== b.isChecked) {
                            return a.isChecked ? 1 : -1;
                          }
                          return a.name.localeCompare(b.name);
                        })
                        .map((item) => (
                          <HStack
                            key={item.id}
                            p={2}
                            borderRadius="md"
                            bg={item.isChecked ? "gray.100" : "transparent"}
                            opacity={item.isChecked ? 0.6 : 1}
                          >
                            <Checkbox
                              isChecked={item.isChecked}
                              onChange={(e) =>
                                handleToggleItem(item.id, e.target.checked)
                              }
                              size="lg"
                            />
                            <Text
                              flex="1"
                              textDecoration={
                                item.isChecked ? "line-through" : "none"
                              }
                            >
                              {item.name}
                            </Text>
                            <Text fontWeight="medium" mr={2}>
                              {item.quantity} {item.unit}
                            </Text>
                            <IconButton
                              aria-label="Delete item"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => onDeleteItem(item.id)}
                            />
                          </HStack>
                        ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
          </Accordion>
        ) : (
          <VStack align="stretch" spacing={2} maxH="500px" overflowY="auto">
            {groceryList.items
              .sort((a, b) => {
                // Sort by checked status first, then by name
                if (a.isChecked !== b.isChecked) {
                  return a.isChecked ? 1 : -1;
                }
                return a.name.localeCompare(b.name);
              })
              .map((item) => (
                <HStack
                  key={item.id}
                  p={2}
                  borderRadius="md"
                  bg={item.isChecked ? "gray.100" : "transparent"}
                  opacity={item.isChecked ? 0.6 : 1}
                >
                  <Checkbox
                    isChecked={item.isChecked}
                    onChange={(e) =>
                      handleToggleItem(item.id, e.target.checked)
                    }
                    size="lg"
                  />
                  <Text
                    flex="1"
                    textDecoration={item.isChecked ? "line-through" : "none"}
                  >
                    {item.name}
                  </Text>
                  <Badge colorScheme="blue" mr={2}>
                    {item.category}
                  </Badge>
                  <Text fontWeight="medium" mr={2}>
                    {item.quantity} {item.unit}
                  </Text>
                  <IconButton
                    aria-label="Delete item"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDeleteItem(item.id)}
                  />
                </HStack>
              ))}
          </VStack>
        )}

        {groceryList.items.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No items in this grocery list yet.</Text>
            <Text color="gray.500" fontSize="sm" mt={2}>
              Add items using the form above or generate from a meal plan.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
