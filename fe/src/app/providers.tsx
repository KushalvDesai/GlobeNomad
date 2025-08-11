"use client";

import { ReactNode, useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@/lib/apollo-client";

export default function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}


