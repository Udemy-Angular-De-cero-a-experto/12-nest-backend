import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // MongooseModule.forRoot( 'mongodb://localhost:27017' ),
    MongooseModule.forRoot( process.env.MONGO_URI ),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
