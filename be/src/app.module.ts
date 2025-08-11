import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TripModule } from './trip/trip.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { CostEstimatorModule } from './cost-estimator/cost-estimator.module';
import { AiCostServiceModule } from './ai-cost-service/ai-cost-service.module';
import { CitiesResolver } from './cities/cities.resolver';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
    }),
    UserModule,
    AuthModule,
    CostEstimatorModule,
    AiCostServiceModule,
    TripModule,
    AdminModule
  ],
  providers: [AppService, CitiesResolver],
})
export class AppModule {}
