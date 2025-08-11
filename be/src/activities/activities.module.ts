import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesService } from './activities.service';
import { ActivitiesResolver } from './activities.resolver';
import { Activity, ActivitySchema, ActivityCategory, ActivityCategorySchema } from './schema/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: ActivityCategory.name, schema: ActivityCategorySchema }
    ]),
  ],
  providers: [ActivitiesResolver, ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}