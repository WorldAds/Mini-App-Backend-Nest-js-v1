import { AdvertisementDTO } from "src/Application/DTOs/managements/AdvertisementDTO";
import { Advertisement } from "src/Domain/Entities/Advertisement";

export interface IAdvertisementService {
    createAdvertisement(advertisementDto: AdvertisementDTO): Promise<Advertisement>;
    getAllAdvertisements(): Promise<Advertisement[]>;
    getAdvertisementById(id: string): Promise<Advertisement>;
    updateAdvertisement(id: string, advertisementDto: Partial<AdvertisementDTO>): Promise<Advertisement>;
    deleteAdvertisement(id: string): Promise<void>;
}
