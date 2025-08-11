    import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
    import { UseGuards } from '@nestjs/common';
    import { AdminService } from './admin.service';
    import { JwtAuthGuard } from '../auth/jwt-auth.guard';
    import { RolesGuard } from '../auth/guards/roles.guard';
    import { Roles } from '../auth/decorators/roles.decorator';
    import { UserRole } from '../user/schema/user.schema';
    import { AdminDashboardStats } from './dto/admin-dashboard.dto';
    import { AdminUsersResponse } from './dto/admin-users.dto';
    import { AdminTripsResponse } from './dto/admin-trips.dto';
    import { User } from '../user/schema/user.schema';

    @Resolver()
    @UseGuards(JwtAuthGuard, RolesGuard)
    export class AdminResolver {
    constructor(private readonly adminService: AdminService) {}

    @Query(() => AdminDashboardStats)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async adminDashboard(): Promise<AdminDashboardStats> {
        return this.adminService.getDashboardStats();
    }

    @Query(() => AdminUsersResponse)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async adminUsers(
        @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
        @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
    ) {
        return this.adminService.getAllUsers(limit, offset);
    }

    @Query(() => AdminTripsResponse)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async adminTrips(
        @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
        @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
    ) {
        return this.adminService.getAllTrips(limit, offset);
    }

    @Mutation(() => User)
    @Roles(UserRole.SUPER_ADMIN)
    async updateUserRole(
        @Args('userId', { type: () => ID }) userId: string,
        @Args('role', { type: () => UserRole }) role: UserRole,
    ) {
        return this.adminService.updateUserRole(userId, role);
    }

    @Mutation(() => User)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async toggleUserStatus(
        @Args('userId', { type: () => ID }) userId: string,
        @Args('isActive') isActive: boolean,
    ) {
        return this.adminService.toggleUserStatus(userId, isActive);
    }

    @Mutation(() => Boolean)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async deleteTrip(
        @Args('tripId', { type: () => ID }) tripId: string,
    ) {
        return this.adminService.deleteTrip(tripId);
    }
    }