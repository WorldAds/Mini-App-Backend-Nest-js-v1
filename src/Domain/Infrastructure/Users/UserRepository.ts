import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { IUserRepository } from './IUserRepository';
import { User } from 'src/Domain/Entities/User';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID format');
      }
      return await this.userRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID');
    }
  }

  async findByWorldId(worldId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { worldId },
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(
      { _id: new ObjectId(id) },
      { ...userData, updatedAt: new Date() }
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found after update`);
    }
    return updated;
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    await this.userRepository.update(
      { _id: new ObjectId(id) },
      {
        avatarUrl,
        updatedAt: new Date()
      }
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found after update`);
    }
    return updated;
  }

  async updateNickname(id: string, nickname: string): Promise<User> {
    await this.userRepository.update(
      { _id: new ObjectId(id) },
      { nickname, updatedAt: new Date() }
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found after update`);
    }
    return updated;
  }

  async updateWalletBalance(id: string, balance: number): Promise<User> {
    await this.userRepository.update(
      { _id: new ObjectId(id) },
      { walletBalance: balance, updatedAt: new Date() }
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found after update`);
    }
    return updated;
  }

  async exists(worldId: string): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { worldId },
    });
    return count > 0;
  }
}
