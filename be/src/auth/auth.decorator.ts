import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLContext, ClerkUser } from '../types/clerk.types';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): ClerkUser => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    if (!gqlContext.req.user) {
      throw new Error('User not found in request context');
    }
    return gqlContext.req.user;
  },
);
