import { Injectable } from '@nestjs/common';
import { IAdvertisementRepository } from './IAdsRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Advertisement } from 'src/Domain/Entities/Advertisement';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

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
    return await this.advertisementRepository.findOne({ 
      where: { _id: new ObjectId(id) }
    });
  }

  async exists(adsName: string): Promise<boolean> {
    const count = await this.advertisementRepository.count({
      where: { adsName },
    });
    return count > 0;
  }
}
