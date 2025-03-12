import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async onApplicationBootstrap() {
    try {
      if (this.connection.isConnected) {
        this.logger.log('📦 Database connected successfully');
        
        // Safely access MongoDB URL
        const mongoOptions = this.connection.options as any;
        const mongoUrl = mongoOptions.url || 'mongodb://localhost:27017';
        this.logger.log(`🔌 Connected to: ${mongoUrl}`);
        
        // Get MongoDB collections using MongoClient
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db();
        const collections = await db.listCollections().toArray();
        await client.close();
        
        this.logger.log(`📚 Available collections: ${collections.map(c => c.name).join(', ')}`);
      }
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onApplicationShutdown() {
    if (this.connection.isConnected) {
      await this.connection.close();
      this.logger.log('📦 Database connection closed');
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}
