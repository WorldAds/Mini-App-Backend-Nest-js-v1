import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { RewardDTO } from 'src/Application/DTOs/managements/RewardDTO';
import { IRewardRepository } from 'src/Domain/Infrastructure/Rewards/IRewardRepository';
import { IAdvertisementRepository } from 'src/Domain/Infrastructure/Advertisements/IAdsRepository';

@Injectable()
export class RewardService {
    constructor(
        @Inject('IRewardRepository')
        private readonly rewardRepository: IRewardRepository,
        @Inject('IAdvertisementRepository')
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async createReward(rewardDto: RewardDTO): Promise<RewardDTO> {
        // Verify advertisement exists
        const adExists = await this.advertisementRepository.findById(rewardDto.adId);
        if (!adExists) {
            throw new NotFoundException(`Advertisement with ID ${rewardDto.adId} not found`);
        }

        return await this.rewardRepository.create(rewardDto);
    }

    async getUserRewards(worldId: string): Promise<RewardDTO[]> {
        return await this.rewardRepository.findByUserId(worldId);
    }

    async getAdRewards(adId: string): Promise<RewardDTO[]> {
        return await this.rewardRepository.findByAdId(adId);
    }

    async getUserTotalRewards(worldId: string): Promise<number> {
        return await this.rewardRepository.getTotalRewardsByUser(worldId);
    }

    async getAdTotalRewards(adId: string): Promise<number> {
        return await this.rewardRepository.getTotalRewardsByAd(adId);
    }
}