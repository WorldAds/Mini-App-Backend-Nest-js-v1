import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { IAdvertisementService } from './ads.service.interface';
import { IAdvertisementRepository } from 'src/Domain/Infrastructure/Advertisements/IAdsRepository';
import { AdvertisementDTO } from 'src/Application/DTOs/managements/AdvertisementDTO';
import { Advertisement } from 'src/Domain/Entities/Advertisement';

@Injectable()
export class AdvertisementService implements IAdvertisementService {
  private readonly logger = new Logger(AdvertisementService.name);

  constructor(
    @Inject('IAdvertisementRepository')
    private readonly advertisementRepository: IAdvertisementRepository,
  ) {}

  async createAdvertisement(
    advertisementDto: AdvertisementDTO,
  ): Promise<Advertisement> {
    this.logger.log(`Creating new advertisement: ${advertisementDto.adsName}`);

    const exists = await this.advertisementRepository.exists(
      advertisementDto.adsName,
    );

    if (exists) {
      throw new ConflictException(
        `Advertisement with name ${advertisementDto.adsName} already exists`,
      );
    }

    const advertisement = new Advertisement(
      advertisementDto.adsName,
      advertisementDto.budget,
      new Date(advertisementDto.startDate),
      new Date(advertisementDto.endDate),
      advertisementDto.targetAudience,
      advertisementDto.locations,
      advertisementDto.creativeType,
      advertisementDto.creativeURL,
    );

    if (advertisement.endDate <= advertisement.startDate) {
      throw new ConflictException('End date must be after start date');
    }

    const created = await this.advertisementRepository.create(advertisement);
    this.logger.log(
      `Advertisement created successfully with ID: ${created._id}`,
    );

    return created;
  }
}
