import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { User, UserSchema } from '../user/schema/user.schema';
import { Trip, TripSchema } from '../trip/schema/trip.schema';
import { UserModule } from '../user/user.module';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    UserModule,
    TripModule,
  ],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {}