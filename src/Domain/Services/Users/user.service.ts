import { Injectable, ConflictException, Logger, Inject, NotFoundException } from '@nestjs/common';
import { IUserService } from './user.service.interface';
import { IUserRepository } from '../../Infrastructure/Users/IUserRepository';
import { User } from 'src/Domain/Entities/User';
import { AvatarType } from 'src/Domain/ValueObjects/AvatarType';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  private readonly avatarBaseUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=';

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(worldId: string, nickname: string, walletAddress: string): Promise<User> {
    this.logger.log(`Creating new user with World ID: ${worldId}`);

    const exists = await this.userRepository.exists(worldId);
    if (exists) {
      throw new ConflictException(`User with World ID ${worldId} already exists`);
    }

    // Generate random avatar
    const avatarSeed = Math.random().toString(36).substring(2, 10);
    const avatarUrl = `${this.avatarBaseUrl}${avatarSeed}`;

    const user = new User(
      worldId,
      nickname,
      AvatarType.Generated,
      avatarUrl,
      walletAddress,
      0 // Initial wallet balance
    );

    const created = await this.userRepository.create(user);
    this.logger.log(`User created successfully with ID: ${created._id}`);

    return created;
  }

  async getUserById(id: string): Promise<User> {
    this.logger.log(`Retrieving user with ID: ${id}`);
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async getUserByWorldId(worldId: string): Promise<User> {
    this.logger.log(`Retrieving user with World ID: ${worldId}`);
    const user = await this.userRepository.findByWorldId(worldId);
    
    if (!user) {
      throw new NotFoundException(`User with World ID ${worldId} not found`);
    }

    return user;
  }

  async updateUserAvatar(id: string, avatarType: string, avatarUrl: string): Promise<User> {
    this.logger.log(`Updating avatar for user with ID: ${id}`);
    
    // Check if user exists
    await this.getUserById(id);
    
    const updated = await this.userRepository.updateAvatar(id, avatarType, avatarUrl);
    this.logger.log(`Avatar updated successfully for user: ${id}`);
    
    return updated;
  }

  async updateUserNickname(id: string, nickname: string): Promise<User> {
    this.logger.log(`Updating nickname for user with ID: ${id}`);
    
    // Check if user exists
    await this.getUserById(id);
    
    const updated = await this.userRepository.updateNickname(id, nickname);
    this.logger.log(`Nickname updated successfully for user: ${id}`);
    
    return updated;
  }

  async updateWalletBalance(id: string, balance: number): Promise<User> {
    this.logger.log(`Updating wallet balance for user with ID: ${id}`);
    
    // Check if user exists
    await this.getUserById(id);
    
    const updated = await this.userRepository.updateWalletBalance(id, balance);
    this.logger.log(`Wallet balance updated successfully for user: ${id}`);
    
    return updated;
  }

  async loginUser(worldId: string, walletAddress: string): Promise<User> {
    this.logger.log(`User login attempt with World ID: ${worldId}`);
    
    // Check if user exists
    const existingUser = await this.userRepository.findByWorldId(worldId);
    
    // If user doesn't exist, create a new one with default nickname
    if (!existingUser) {
      this.logger.log(`New user login, creating account for World ID: ${worldId}`);
      const nickname = `User_${worldId.substring(0, 6)}`;
      return await this.createUser(worldId, nickname, walletAddress);
    }
    
    // If wallet address has changed, update it
    if (existingUser.walletAddress !== walletAddress) {
      this.logger.log(`Updating wallet address for user: ${worldId}`);
      await this.userRepository.update(existingUser._id.toString(), {
        walletAddress,
        updatedAt: new Date()
      });
    }
    
    return existingUser;
  }
}
