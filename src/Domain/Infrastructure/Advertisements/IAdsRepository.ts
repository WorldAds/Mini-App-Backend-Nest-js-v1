import { Advertisement } from 'src/Domain/Entities/Advertisement';

export interface IAdvertisementRepository {
  create(advertisement: Advertisement): Promise<Advertisement>;
  findById(id: string): Promise<Advertisement | null>;
  exists(adsName: string): Promise<boolean>;
  findAll(): Promise<Advertisement[]>;
}
