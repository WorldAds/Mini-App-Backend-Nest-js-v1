import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteController } from '../Controllers/managements/favorites.controller';
import { FavoriteService } from 'src/Domain/Services/Favorites/favorites.service';
import { Favorite } from 'src/Domain/Entities/Favorite';
import { FavoriteRepository } from 'src/Domain/Infrastructure/Favorites/FavoriteRepository';
import { AdvertisementModule } from './AdvertisementModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite]),
    AdvertisementModule,  // This will provide IAdvertisementRepository
  ],
  controllers: [FavoriteController],
  providers: [
    FavoriteService,
    {
      provide: 'IFavoriteRepository',
      useClass: FavoriteRepository,
    }
  ],
  exports: [FavoriteService],
})
export class FavoriteModule {}