"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "../lib/context/AuthContext";
import { Providers as ReduxProviders } from "../lib/redux/providers";
import theme from "../styles/theme";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProviders>
      <AuthProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </AuthProvider>
    </ReduxProviders>
  );
}
