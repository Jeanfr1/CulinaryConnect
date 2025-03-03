"use client";

import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import NextLink from "next/link";

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={"500"} fontSize={"lg"} mb={2}>
      {children}
    </Text>
  );
};

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: React.ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
      borderTop={1}
      borderStyle={"solid"}
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Container as={Stack} maxW={"6xl"} py={10}>
        <SimpleGrid
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text
                fontSize={"xl"}
                fontWeight={"bold"}
                color={useColorModeValue("brand.600", "white")}
              >
                CulinaryConnect
              </Text>
            </Box>
            <Text fontSize={"sm"}>
              © {new Date().getFullYear()} CulinaryConnect. All rights reserved
            </Text>
            <Stack direction={"row"} spacing={6}>
              <SocialButton label={"Twitter"} href={"#"}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={"YouTube"} href={"#"}>
                <FaYoutube />
              </SocialButton>
              <SocialButton label={"Instagram"} href={"#"}>
                <FaInstagram />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Company</ListHeader>
            <Link as={NextLink} href={"/about"}>
              About
            </Link>
            <Link as={NextLink} href={"/blog"}>
              Blog
            </Link>
            <Link as={NextLink} href={"/contact"}>
              Contact
            </Link>
            <Link as={NextLink} href={"/careers"}>
              Careers
            </Link>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Support</ListHeader>
            <Link as={NextLink} href={"/help"}>
              Help Center
            </Link>
            <Link as={NextLink} href={"/terms"}>
              Terms of Service
            </Link>
            <Link as={NextLink} href={"/privacy"}>
              Privacy Policy
            </Link>
            <Link as={NextLink} href={"/faq"}>
              FAQ
            </Link>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Features</ListHeader>
            <Link as={NextLink} href={"/recipes"}>
              Recipe Repository
            </Link>
            <Link as={NextLink} href={"/meal-planner"}>
              Meal Planning
            </Link>
            <Link as={NextLink} href={"/grocery-lists"}>
              Grocery Lists
            </Link>
            <Link as={NextLink} href={"/nutrition"}>
              Nutrition Info
            </Link>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Community</ListHeader>
            <Link as={NextLink} href={"/users"}>
              Users
            </Link>
            <Link as={NextLink} href={"/activity"}>
              Latest Activity
            </Link>
            <Link as={NextLink} href={"/recipes/popular"}>
              Popular Recipes
            </Link>
            <Link as={NextLink} href={"/recipes/categories"}>
              Categories
            </Link>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
