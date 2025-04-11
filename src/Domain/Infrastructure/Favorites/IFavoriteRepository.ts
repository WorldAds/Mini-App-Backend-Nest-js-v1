import { FavoriteDTO } from "src/Application/DTOs/managements/FavoriteDTO";

export interface IFavoriteRepository {
    create(favorite: FavoriteDTO): Promise<FavoriteDTO>;
    findByAdAndUser(adId: string, worldId: string): Promise<FavoriteDTO | null>;
    findByUser(worldId: string): Promise<FavoriteDTO[]>;
    exists(adId: string, worldId: string): Promise<boolean>;
    delete(adId: string, worldId: string): Promise<void>;
    getAdFavoriteCount(adId: string): Promise<number>;
}