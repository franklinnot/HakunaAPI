import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DbConfigModule implements OnModuleInit {
  onModuleInit() {
    mongoose.set('toJSON', { virtuals: true });
    mongoose.set('toObject', { virtuals: true });
  }
}
