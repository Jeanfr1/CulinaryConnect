"use client";

import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import NextLink from "next/link";
import { useAuth } from "../../lib/context/AuthContext";
import { signOut } from "../../lib/supabase/client";
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks";
import { clearUser } from "../../lib/redux/slices/userSlice";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated, authUser } = useAuth();
  const userProfile = useAppSelector((state) => state.user.profile);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      dispatch(clearUser());
      toast({
        title: "Signed out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    } else {
      toast({
        title: "Error signing out",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Text
            textAlign={useBreakpointValue({ base: "center", md: "left" })}
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
            fontWeight="bold"
            fontSize="xl"
            as={NextLink}
            href="/"
          >
            CulinaryConnect
          </Text>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar
                  size={"sm"}
                  src={userProfile?.avatar_url || ""}
                  name={userProfile?.full_name || userProfile?.username || ""}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={NextLink} href="/profile">
                  Profile
                </MenuItem>
                <MenuItem as={NextLink} href="/recipes/my-recipes">
                  My Recipes
                </MenuItem>
                <MenuItem as={NextLink} href="/meal-planning">
                  Meal Plans
                </MenuItem>
                <MenuItem as={NextLink} href="/grocery-list">
                  Grocery Lists
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={NextLink}
                fontSize={"sm"}
                fontWeight={400}
                variant={"link"}
                href={"/auth"}
              >
                Sign In
              </Button>
              <Button
                as={NextLink}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"brand.500"}
                href={"/auth?tab=signup"}
                _hover={{
                  bg: "brand.400",
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");
  const { isAuthenticated } = useAuth();

  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated).map(
        (navItem) => (
          <Box key={navItem.label}>
            <Popover trigger={"hover"} placement={"bottom-start"}>
              <PopoverTrigger>
                <Link
                  p={2}
                  href={navItem.href ?? "#"}
                  fontSize={"sm"}
                  fontWeight={500}
                  color={linkColor}
                  _hover={{
                    textDecoration: "none",
                    color: linkHoverColor,
                  }}
                  as={NextLink}
                >
                  {navItem.label}
                </Link>
              </PopoverTrigger>

              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={"xl"}
                  bg={popoverContentBgColor}
                  p={4}
                  rounded={"xl"}
                  minW={"sm"}
                >
                  <Stack>
                    {navItem.children
                      .filter((child) => !child.requiresAuth || isAuthenticated)
                      .map((child) => (
                        <DesktopSubNav key={child.label} {...child} />
                      ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        )
      )}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      href={href}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{ bg: useColorModeValue("brand.50", "gray.900") }}
      as={NextLink}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: "brand.500" }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={"sm"}>{subLabel}</Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"brand.500"} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated).map(
        (navItem) => (
          <MobileNavItem key={navItem.label} {...navItem} />
        )
      )}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated } = useAuth();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? "#"}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children
              .filter((child) => !child.requiresAuth || isAuthenticated)
              .map((child) => (
                <Link key={child.label} py={2} href={child.href} as={NextLink}>
                  {child.label}
                </Link>
              ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Recipes",
    children: [
      {
        label: "Browse Recipes",
        subLabel: "Find recipes from our community",
        href: "/recipes",
      },
      {
        label: "My Recipes",
        subLabel: "View and manage your recipes",
        href: "/recipes/my-recipes",
        requiresAuth: true,
      },
      {
        label: "Create Recipe",
        subLabel: "Share your culinary creations",
        href: "/recipes/create",
        requiresAuth: true,
      },
    ],
  },
  {
    label: "Meal Planning",
    children: [
      {
        label: "My Meal Plans",
        subLabel: "View and manage your meal plans",
        href: "/meal-planning",
        requiresAuth: true,
      },
      {
        label: "Create Meal Plan",
        subLabel: "Plan your meals for the week",
        href: "/meal-planning/create",
        requiresAuth: true,
      },
    ],
    requiresAuth: true,
  },
  {
    label: "Grocery Lists",
    href: "/grocery-list",
    requiresAuth: true,
  },
  {
    label: "Community",
    children: [
      {
        label: "Popular Chefs",
        subLabel: "Discover top contributors",
        href: "/profile",
      },
      {
        label: "Trending Recipes",
        subLabel: "See what's popular right now",
        href: "/search",
      },
    ],
  },
];
