import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement } from 'src/Domain/Entities/Advertisement';
import { AdvertisementController } from '../Controllers/managements/ads.controller';
import { AdvertisementService } from 'src/Domain/Services/Advertisements/ads.service';
import { AdvertisementRepository } from 'src/Domain/Infrastructure/Advertisements/AdsRepository';

@Module({
  imports: [TypeOrmModule.forFeature([Advertisement])],
  controllers: [AdvertisementController],
  providers: [
    AdvertisementService,
    {
      provide: 'IAdvertisementRepository',
      useClass: AdvertisementRepository,
    },
  ],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
