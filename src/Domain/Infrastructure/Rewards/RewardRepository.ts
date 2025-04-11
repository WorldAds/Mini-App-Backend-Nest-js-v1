import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Reward } from 'src/Domain/Entities/Reward';
import { RewardDTO } from 'src/Application/DTOs/managements/RewardDTO';
import { IRewardRepository } from './IRewardRepository';

@Injectable()
export class RewardRepository implements IRewardRepository {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
  ) {}

  private mapToDTO(reward: Reward): RewardDTO {
    return {
      adId: reward.adId,
      worldId: reward.worldId,
      rewardedAmount: reward.rewardedAmount,
      createdAt: reward.createdAt,
      chainId: reward.chainId,
      txHash: reward.txHash,
    };
  }

  async create(rewardDto: RewardDTO): Promise<RewardDTO> {
    const reward = new Reward(
      rewardDto.worldId,
      rewardDto.adId,
      rewardDto.rewardedAmount,
      rewardDto.chainId,
      rewardDto.txHash,
    );

    const created = await this.rewardRepository.save(reward);
    return this.mapToDTO(created);
  }

  async findByUserId(worldId: string): Promise<RewardDTO[]> {
    const rewards = await this.rewardRepository.find({
      where: { worldId },
    });
    return rewards.map((reward) => this.mapToDTO(reward));
  }

  async findByAdId(adId: string): Promise<RewardDTO[]> {
    const rewards = await this.rewardRepository.find({
      where: { adId },
    });
    return rewards.map((reward) => this.mapToDTO(reward));
  }

  async findByUserAndAd(
    worldId: string,
    adId: string,
  ): Promise<RewardDTO | null> {
    const reward = await this.rewardRepository.findOne({
      where: { worldId, adId },
    });
    return reward ? this.mapToDTO(reward) : null;
  }

  async getTotalRewardsByUser(worldId: string): Promise<number> {
    const result = await this.rewardRepository
      .createQueryBuilder('reward')
      .where('reward.worldId = :worldId', { worldId })
      .select('SUM(reward.rewardedAmount)', 'total')
      .getRawOne();
    return result?.total || 0;
  }

  async getTotalRewardsByAd(adId: string): Promise<number> {
    const result = await this.rewardRepository
      .createQueryBuilder('reward')
      .where('reward.adId = :adId', { adId })
      .select('SUM(reward.rewardedAmount)', 'total')
      .getRawOne();
    return result?.total || 0;
  }
}
