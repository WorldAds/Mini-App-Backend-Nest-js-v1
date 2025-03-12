import { Injectable, ConflictException, Logger, Inject, NotFoundException } from '@nestjs/common';
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

  async getAllAdvertisements(): Promise<Advertisement[]> {
    this.logger.log('Retrieving all advertisements');
    const advertisements = await this.advertisementRepository.findAll();
    this.logger.log(`Retrieved ${advertisements.length} advertisements`);
    return advertisements;
  }

  async getAdvertisementById(id: string): Promise<Advertisement> {
    this.logger.log(`Retrieving advertisement with ID: ${id}`);
    const advertisement = await this.advertisementRepository.findById(id);
    
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    return advertisement;
  }

  async updateAdvertisement(
    id: string,
    advertisementDto: Partial<AdvertisementDTO>,
  ): Promise<Advertisement> {
    this.logger.log(`Updating advertisement with ID: ${id}`);

    // Check if advertisement exists
    const existingAd = await this.advertisementRepository.findById(id);
    if (!existingAd) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    // Only check name conflict if name is being updated
    if (advertisementDto.adsName && advertisementDto.adsName !== existingAd.adsName) {
      const nameExists = await this.advertisementRepository.existsWithNameExcludingId(
        advertisementDto.adsName,
        id
      );
      if (nameExists) {
        throw new ConflictException(
          `Advertisement with name ${advertisementDto.adsName} already exists`
        );
      }
    }

    // Merge existing data with update data
    const updatedAdvertisement = new Advertisement(
      advertisementDto.adsName ?? existingAd.adsName,
      advertisementDto.budget ?? existingAd.budget,
      advertisementDto.startDate ? new Date(advertisementDto.startDate) : existingAd.startDate,
      advertisementDto.endDate ? new Date(advertisementDto.endDate) : existingAd.endDate,
      advertisementDto.targetAudience ?? existingAd.targetAudience,
      advertisementDto.locations ?? existingAd.locations,
      advertisementDto.creativeType ?? existingAd.creativeType,
      advertisementDto.creativeURL ?? existingAd.creativeURL,
    );

    // Validate dates if either date is being updated
    if (advertisementDto.startDate || advertisementDto.endDate) {
      if (updatedAdvertisement.endDate <= updatedAdvertisement.startDate) {
        throw new ConflictException('End date must be after start date');
      }
    }

    const updated = await this.advertisementRepository.update(id, updatedAdvertisement);
    this.logger.log(`Advertisement updated successfully: ${id}`);

    return updated;
  }

  async deleteAdvertisement(id: string): Promise<void> {
    this.logger.log(`Deleting advertisement with ID: ${id}`);
    
    // Check if advertisement exists
    const advertisement = await this.advertisementRepository.findById(id);
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    await this.advertisementRepository.delete(id);
    this.logger.log(`Advertisement deleted successfully: ${id}`);
  }
}
