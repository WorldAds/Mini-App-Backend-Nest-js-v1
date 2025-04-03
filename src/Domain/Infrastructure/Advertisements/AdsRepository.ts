import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ObjectId } from 'mongodb';

import { IAdvertisementRepository } from './IAdsRepository';
import { Advertisement } from 'src/Domain/Entities/Advertisement';

@Injectable()
export class AdvertisementRepository implements IAdvertisementRepository {
  constructor(
    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  async create(advertisement: Advertisement): Promise<Advertisement> {
    return await this.advertisementRepository.save(advertisement);
  }

  async findById(id: string): Promise<Advertisement | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid advertisement ID format');
      }
      return await this.advertisementRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid advertisement ID');
    }
  }

  async exists(adsName: string): Promise<boolean> {
    const count = await this.advertisementRepository.count({
      where: { adsName },
    });
    return count > 0;
  }

  async findAll(): Promise<Advertisement[]> {
    return await this.advertisementRepository.find({
      order: {
        adsName: 'ASC', // Optional: order by name
      },
    });
  }

  async update(
    id: string,
    advertisement: Advertisement,
  ): Promise<Advertisement> {
    // Remove _id from the update payload
    const { _id, ...updateData } = advertisement;
    
    await this.advertisementRepository.update(
      { _id: new ObjectId(id) },
      updateData
    );
    
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Advertisement with id ${id} not found after update`);
    }
    return updated;
  }

  async existsWithNameExcludingId(
    adsName: string,
    id: string,
  ): Promise<boolean> {
    const count = await this.advertisementRepository.count({
      where: {
        adsName,
        _id: Not(new ObjectId(id)),
      },
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    const result = await this.advertisementRepository.delete({ _id: new ObjectId(id) });
    if (result.affected === 0) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }
  }
}
