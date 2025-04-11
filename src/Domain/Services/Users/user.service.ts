import { Injectable, ConflictException, Logger, Inject, NotFoundException } from '@nestjs/common';
import { IUserService } from './user.service.interface';
import { IUserRepository } from '../../Infrastructure/Users/IUserRepository';
import { User } from 'src/Domain/Entities/User';
import { FileUploadService } from 'src/infrastructure/file-upload/file-upload.service';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  private readonly avatarBaseUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=';

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly fileUploadService: FileUploadService,
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
      walletAddress,
      0, // Initial wallet balance
      avatarUrl
    );

    // If the avatarUrl is a local path (starts with 'avatars/'), add the /uploads/ prefix before saving
    if (user.avatarUrl && user.avatarUrl.startsWith('avatars/') && !user.avatarUrl.startsWith('/uploads/')) {
      user.avatarUrl = this.fileUploadService.getAvatarUrl(user.avatarUrl);
    }

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

    // The avatarUrl should already have the correct format in the database

    return user;
  }

  async getUserByWorldId(worldId: string): Promise<User> {
    this.logger.log(`Retrieving user with World ID: ${worldId}`);
    const user = await this.userRepository.findByWorldId(worldId);

    if (!user) {
      throw new NotFoundException(`User with World ID ${worldId} not found`);
    }

    // The avatarUrl should already have the correct format in the database

    return user;
  }

  async updateUserAvatar(id: string, avatarUrl: string): Promise<User> {
    this.logger.log(`Updating avatar for user with ID: ${id}`);

    // Check if user exists
    const user = await this.getUserById(id);

    // If the user already has a custom avatar, delete the old file
    if (user.avatarUrl && user.avatarUrl.includes('/uploads/avatars/')) {
      try {
        // Remove the /uploads/ prefix for the file deletion
        const relativePath = user.avatarUrl.replace(/^\/uploads\//, '');
        await this.fileUploadService.deleteFile(relativePath);
      } catch (error) {
        this.logger.warn(`Failed to delete old avatar: ${error.message}`);
        // Continue with the update even if deletion fails
      }
    }

    // If the avatarUrl doesn't start with /uploads/ and it's a local path, add the prefix
    let fullAvatarUrl = avatarUrl;
    if (avatarUrl && avatarUrl.startsWith('avatars/') && !avatarUrl.startsWith('/uploads/')) {
      fullAvatarUrl = this.fileUploadService.getAvatarUrl(avatarUrl);
    }

    const updated = await this.userRepository.updateAvatar(id, fullAvatarUrl);
    this.logger.log(`Avatar updated successfully for user: ${id}`);

    return updated;
  }

  async uploadAvatar(id: string, file: Express.Multer.File): Promise<User> {
    this.logger.log(`Uploading avatar for user with ID: ${id}`);

    // Check if user exists
    const user = await this.getUserById(id);

    // Save the file
    const relativePath = await this.fileUploadService.saveAvatar(file);

    // If the user already has a custom avatar, delete the old file
    if (user.avatarUrl && user.avatarUrl.includes('/uploads/avatars/')) {
      try {
        // Remove the /uploads/ prefix for the file deletion
        const oldRelativePath = user.avatarUrl.replace(/^\/uploads\//, '');
        await this.fileUploadService.deleteFile(oldRelativePath);
      } catch (error) {
        this.logger.warn(`Failed to delete old avatar: ${error.message}`);
        // Continue with the update even if deletion fails
      }
    }

    // Store the full path with /uploads/ prefix in the database
    const fullPath = this.fileUploadService.getAvatarUrl(relativePath);
    const updated = await this.userRepository.updateAvatar(id, fullPath);
    this.logger.log(`Avatar uploaded successfully for user: ${id}`);

    return updated;
  }

  async updateUserNickname(id: string, nickname: string): Promise<User> {
    this.logger.log(`Updating nickname for user with ID: ${id}`);

    // Check if user exists
    await this.getUserById(id);

    const updated = await this.userRepository.updateNickname(id, nickname);
    this.logger.log(`Nickname updated successfully for user: ${id}`);

    // The avatarUrl should already have the correct format in the database

    return updated;
  }

  async updateWalletBalance(id: string, balance: number): Promise<User> {
    this.logger.log(`Updating wallet balance for user with ID: ${id}`);

    // Check if user exists
    await this.getUserById(id);

    const updated = await this.userRepository.updateWalletBalance(id, balance);
    this.logger.log(`Wallet balance updated successfully for user: ${id}`);

    // The avatarUrl should already have the correct format in the database

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

    // The avatarUrl should already have the correct format in the database

    return existingUser;
  }
}
