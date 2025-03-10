import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './Infrastructure/database/database.module';
import { AdvertisementModule } from './Application/Modules/AdvertisementModule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    AdvertisementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
