import { Injectable, ConflictException, NotFoundException, Logger, Inject } from '@nestjs/common';
import { FavoriteDTO } from 'src/Application/DTOs/managements/FavoriteDTO';
import { IAdvertisementRepository } from 'src/Domain/Infrastructure/Advertisements/IAdsRepository';
import { IFavoriteService } from './favorites.service.interface';
import { IFavoriteRepository } from 'src/Domain/Infrastructure/Favorites/IFavoriteRepository';

@Injectable()
export class FavoriteService implements IFavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    @Inject('IFavoriteRepository')
    private readonly favoriteRepository: IFavoriteRepository,
    @Inject('IAdvertisementRepository')
    private readonly advertisementRepository: IAdvertisementRepository,
  ) {}

  async addToFavorites(favoriteDto: FavoriteDTO): Promise<FavoriteDTO> {
    // Check if advertisement exists
    const adExists = await this.advertisementRepository.findById(favoriteDto.adId);
    if (!adExists) {
      throw new NotFoundException(`Advertisement with ID ${favoriteDto.adId} not found`);
    }

    // Check if already favorited
    const exists = await this.favoriteRepository.exists(
      favoriteDto.adId,
      favoriteDto.userAddress,
    );
    if (exists) {
      throw new ConflictException('Advertisement is already in favorites');
    }

    // Set creation timestamp
    favoriteDto.createdAt = new Date();

    return await this.favoriteRepository.create(favoriteDto);
  }

  async removeFromFavorites(adId: string, userAddress: string): Promise<void> {
    const favorite = await this.favoriteRepository.findByAdAndUser(adId, userAddress);
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.delete(adId, userAddress);
  }

  async getUserFavorites(userAddress: string): Promise<FavoriteDTO[]> {
    return await this.favoriteRepository.findByUser(userAddress);
  }

  async getAdFavoriteCount(adId: string): Promise<number> {
    return await this.favoriteRepository.getAdFavoriteCount(adId);
  }
}