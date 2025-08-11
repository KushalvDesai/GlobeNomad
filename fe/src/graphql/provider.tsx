"use client";

import { ApolloProvider } from '@apollo/client';
import client from './client';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
