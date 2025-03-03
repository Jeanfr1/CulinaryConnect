"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  allowCustomTags?: boolean;
}

const TagSelector = ({
  availableTags,
  selectedTags,
  onChange,
  allowCustomTags = false,
}: TagSelectorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  const tagBg = useColorModeValue("teal.100", "teal.800");
  const tagActiveBg = useColorModeValue("teal.500", "teal.200");
  const tagActiveColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    // Filter available tags based on input and exclude already selected tags
    const filtered = availableTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      )
      .slice(0, 10); // Limit to 10 suggestions

    setFilteredTags(filtered);
  }, [inputValue, availableTags, selectedTags]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      // Add tag if not already selected
      onChange([...selectedTags, tag]);
    }
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();

      // If the exact tag exists in available tags, select it
      const existingTag = availableTags.find(
        (tag) => tag.toLowerCase() === inputValue.toLowerCase()
      );

      if (existingTag) {
        handleTagClick(existingTag);
      } else if (allowCustomTags) {
        // Add custom tag if allowed
        const newTag = inputValue.trim();
        if (!selectedTags.includes(newTag)) {
          onChange([...selectedTags, newTag]);
        }
      }

      setInputValue("");
    }
  };

  const handleAddCustomTag = () => {
    if (inputValue.trim() && allowCustomTags) {
      const newTag = inputValue.trim();
      if (!selectedTags.includes(newTag)) {
        onChange([...selectedTags, newTag]);
      }
      setInputValue("");
    }
  };

  return (
    <Box>
      <InputGroup size="md" mb={4}>
        <Input
          placeholder="Search or add tags..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        {allowCustomTags && inputValue.trim() && (
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleAddCustomTag}
              leftIcon={<FaPlus />}
            >
              Add
            </Button>
          </InputRightElement>
        )}
      </InputGroup>

      {/* Selected Tags */}
      <Box mb={4}>
        <Wrap spacing={2}>
          {selectedTags.map((tag) => (
            <WrapItem key={tag}>
              <Tag
                size="md"
                borderRadius="full"
                variant="solid"
                bg={tagActiveBg}
                color={tagActiveColor}
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleTagClick(tag)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Tag Suggestions */}
      {inputValue && filteredTags.length > 0 && (
        <Box mb={4}>
          <Wrap spacing={2}>
            {filteredTags.map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  size="md"
                  borderRadius="full"
                  variant="subtle"
                  bg={tagBg}
                  cursor="pointer"
                  onClick={() => handleTagClick(tag)}
                  _hover={{ opacity: 0.8 }}
                >
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}

      {/* Popular Tags (when no input) */}
      {!inputValue && availableTags.length > 0 && (
        <Box>
          <Wrap spacing={2}>
            {availableTags.slice(0, 15).map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  size="md"
                  borderRadius="full"
                  variant="subtle"
                  bg={selectedTags.includes(tag) ? tagActiveBg : tagBg}
                  color={
                    selectedTags.includes(tag) ? tagActiveColor : "inherit"
                  }
                  cursor="pointer"
                  onClick={() => handleTagClick(tag)}
                  _hover={{ opacity: 0.8 }}
                >
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </Box>
  );
};

export default TagSelector;
