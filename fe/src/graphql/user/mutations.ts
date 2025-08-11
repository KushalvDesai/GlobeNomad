import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      name
      email
      firstName
      lastName
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      token
      user {
        id
        name
        email
        firstName
        lastName
      }
    }
  }
`;

export const SYNC_USER = gql`
  mutation SyncUser {
    syncUser {
      id
      name
      email
      firstName
      lastName
    }
  }
`;
