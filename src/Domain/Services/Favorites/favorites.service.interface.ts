import { FavoriteDTO } from "src/Application/DTOs/managements/FavoriteDTO";

export interface IFavoriteService {
    addToFavorites(favoriteDto: FavoriteDTO): Promise<FavoriteDTO>;
    removeFromFavorites(adId: string, userAddress: string): Promise<void>;
    getUserFavorites(userAddress: string): Promise<FavoriteDTO[]>;
    getAdFavoriteCount(adId: string): Promise<number>;
}