import { FavoriteDTO } from "src/Application/DTOs/managements/FavoriteDTO";

export interface IFavoriteService {
    addToFavorites(favoriteDto: FavoriteDTO): Promise<FavoriteDTO>;
    removeFromFavorites(adId: string, worldId: string): Promise<void>;
    getUserFavorites(worldId: string): Promise<FavoriteDTO[]>;
    getAdFavoriteCount(adId: string): Promise<number>;
}