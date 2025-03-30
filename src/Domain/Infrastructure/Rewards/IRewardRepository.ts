import { RewardDTO } from "src/Application/DTOs/managements/RewardDTO";

export interface IRewardRepository {
    create(reward: RewardDTO): Promise<RewardDTO>;
    findByUserId(userId: string): Promise<RewardDTO[]>;
    findByAdId(adId: string): Promise<RewardDTO[]>;
    findByUserAndAd(userId: string, adId: string): Promise<RewardDTO | null>;
    getTotalRewardsByUser(userId: string): Promise<number>;
    getTotalRewardsByAd(adId: string): Promise<number>;
}