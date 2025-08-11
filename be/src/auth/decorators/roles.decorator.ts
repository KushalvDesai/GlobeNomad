import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/schema/user.schema';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);