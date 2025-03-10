import { AdvertisementDTO } from "src/Application/DTOs/managements/AdvertisementDTO";
import { Advertisement } from "src/Domain/Entities/Advertisement";

export interface IAdvertisementService {
    createAdvertisement(advertisementDto: AdvertisementDTO): Promise<Advertisement>;
}