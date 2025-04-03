import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFavoriteRepository } from './IFavoriteRepository';
import { Favorite } from 'src/Domain/Entities/Favorite';
import { FavoriteDTO } from 'src/Application/DTOs/managements/FavoriteDTO';

@Injectable()
export class FavoriteRepository implements IFavoriteRepository {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
    ) {}

    async create(favoriteDto: FavoriteDTO): Promise<FavoriteDTO> {
        const favorite = new Favorite(
            favoriteDto.adId,
            favoriteDto.userAddress,
            favoriteDto.note,
        );
        
        const created = await this.favoriteRepository.save(favorite);
        
        return this.mapToDTO(created);
    }

    async findByAdAndUser(adId: string, userAddress: string): Promise<FavoriteDTO | null> {
        const favorite = await this.favoriteRepository.findOne({
            where: {
                adId,
                userAddress,
            },
        });

        return favorite ? this.mapToDTO(favorite) : null;
    }

    async findByUser(userAddress: string): Promise<FavoriteDTO[]> {
        const favorites = await this.favoriteRepository.find({
            where: { userAddress },
            order: { createdAt: 'DESC' },
        });

        return favorites.map(favorite => this.mapToDTO(favorite));
    }

    async exists(adId: string, userAddress: string): Promise<boolean> {
        const count = await this.favoriteRepository.count({
            where: {
                adId,
                userAddress,
            },
        });
        return count > 0;
    }

    async delete(adId: string, userAddress: string): Promise<void> {
        const result = await this.favoriteRepository.delete({
            adId,
            userAddress,
        });

        if (result.affected === 0) {
            throw new NotFoundException('Favorite not found');
        }
    }

    async getAdFavoriteCount(adId: string): Promise<number> {
        return await this.favoriteRepository.count({
            where: { adId },
        });
    }

    private mapToDTO(favorite: Favorite): FavoriteDTO {
        const dto = new FavoriteDTO();
        dto.adId = favorite.adId;
        dto.userAddress = favorite.userAddress;
        dto.createdAt = favorite.createdAt;
        dto.note = favorite.note;
        return dto;
    }
}