import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return await this.advertisementRepository.findOne({ 
      where: { _id: new ObjectId(id) }
    });
  }

  async exists(adsName: string): Promise<boolean> {
    const matchedAds = await this.advertisementRepository.find({ where: { adsName } });

    return matchedAds.length > 0;
  }
}
