import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AdvertisementModule } from './Application/Modules/AdvertisementModule';
import { FavoriteModule } from './Application/Modules/FavoriteModule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    AdvertisementModule,
    FavoriteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
