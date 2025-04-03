import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { Advertisement } from '../../Domain/Entities/Advertisement';
import { Favorite } from '../../Domain/Entities/Favorite';
import { Reward } from '../../Domain/Entities/Reward';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('MONGODB_URL'),
        entities: [Advertisement, Favorite, Reward],
        synchronize: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        logging: true,
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
