import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly avatarDir = join(this.uploadDir, 'avatars');

  constructor() {
    // Ensure upload directories exist
    this.ensureDirectoryExists(this.uploadDir);
    this.ensureDirectoryExists(this.avatarDir);
  }

  private ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
      this.logger.log(`Creating directory: ${directory}`);
      mkdirSync(directory, { recursive: true });
    }
  }

  async saveAvatar(file: Express.Multer.File): Promise<string> {
    try {
      // Generate a unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = join(this.avatarDir, fileName);

      // Save the file
      await fs.writeFile(filePath, file.buffer);
      
      // Return the relative path to the file
      return `avatars/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to save avatar: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteFile(relativePath: string): Promise<void> {
    try {
      const filePath = join(this.uploadDir, relativePath);
      
      // Check if file exists before attempting to delete
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        this.logger.log(`Deleted file: ${filePath}`);
      } else {
        this.logger.warn(`File not found for deletion: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw error;
    }
  }

  getAvatarUrl(relativePath: string): string {
    return `/uploads/${relativePath}`;
  }
}
