import { FavoriteDTO } from "src/Application/DTOs/managements/FavoriteDTO";

export interface IFavoriteRepository {
    create(favorite: FavoriteDTO): Promise<FavoriteDTO>;
    findByAdAndUser(adId: string, userAddress: string): Promise<FavoriteDTO | null>;
    findByUser(userAddress: string): Promise<FavoriteDTO[]>;
    exists(adId: string, userAddress: string): Promise<boolean>;
    delete(adId: string, userAddress: string): Promise<void>;
    getAdFavoriteCount(adId: string): Promise<number>;
}