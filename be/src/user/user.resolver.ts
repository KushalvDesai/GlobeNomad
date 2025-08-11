import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './schema/user.schema';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ClerkAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { ClerkUser } from '../types/clerk.types';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @UseGuards(ClerkAuthGuard)
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { nullable: true })
  @UseGuards(ClerkAuthGuard)
  async user(@Args('id') id: string): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(ClerkAuthGuard)
  async me(@CurrentUser() user: ClerkUser): Promise<User | null> {
    return this.userService.findByClerkId(user.id);
  }

  @Mutation(() => User)
  @UseGuards(ClerkAuthGuard)
  async syncUser(@CurrentUser() user: ClerkUser): Promise<User> {
    return this.userService.syncWithClerk(user.id);
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
