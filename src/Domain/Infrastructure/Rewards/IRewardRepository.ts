import { RewardDTO } from "src/Application/DTOs/managements/RewardDTO";

export interface IRewardRepository {
    create(reward: RewardDTO): Promise<RewardDTO>;
    findByUserId(worldId: string): Promise<RewardDTO[]>;
    findByAdId(adId: string): Promise<RewardDTO[]>;
    findByUserAndAd(worldId: string, adId: string): Promise<RewardDTO | null>;
    getTotalRewardsByUser(worldId: string): Promise<number>;
    getTotalRewardsByAd(adId: string): Promise<number>;
}