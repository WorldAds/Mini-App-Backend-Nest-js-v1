import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Advertisement } from '../../Domain/Entities/Advertisement';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URL'),
        entities: [Advertisement], // Explicitly register the Advertisement entity
        synchronize: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        logging: true,
        logger: 'advanced-console', // Add this for more detailed logging
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
