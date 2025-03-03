import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#f5f9ff",
    100: "#e0edff",
    200: "#c0daff",
    300: "#94c2ff",
    400: "#609fff",
    500: "#3d7eff",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  accent: {
    50: "#fff8f1",
    100: "#ffe8d5",
    200: "#ffd2aa",
    300: "#ffb77d",
    400: "#ff9a4d",
    500: "#ff7b1f",
    600: "#ff5a00",
    700: "#cc4700",
    800: "#993600",
    900: "#662400",
  },
};

const fonts = {
  heading: "var(--font-geist-sans)",
  body: "var(--font-geist-sans)",
  mono: "var(--font-geist-mono)",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "medium",
      borderRadius: "md",
    },
    variants: {
      solid: {
        bg: "brand.600",
        color: "white",
        _hover: {
          bg: "brand.700",
        },
      },
      outline: {
        borderColor: "brand.600",
        color: "brand.600",
        _hover: {
          bg: "brand.50",
        },
      },
      ghost: {
        color: "brand.600",
        _hover: {
          bg: "brand.50",
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: "lg",
        boxShadow: "md",
      },
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
});

export default theme;
