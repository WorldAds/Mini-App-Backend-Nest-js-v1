import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreativeType } from '../src/Domain/ValueObjects/CreativeType';

describe('AdvertisementController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/advertisements', () => {
    it('should create a new advertisement', () => {
      const newAd = {
        adsName: 'Test Advertisement',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York', 'Los Angeles'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      return request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(newAd)
        .expect(201)
        .expect((response) => {
          expect(response.body).toMatchObject({
            adsName: newAd.adsName,
            budget: newAd.budget,
            targetAudience: newAd.targetAudience,
            locations: newAd.locations,
            creativeType: newAd.creativeType,
            creativeURL: newAd.creativeURL,
          });
          expect(response.body._id).toBeDefined();
        });
    });

    it('should return 409 when advertisement name already exists', async () => {
      const existingAd = {
        adsName: 'Existing Ad',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      // First create an ad
      await request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(existingAd)
        .expect(201);

      // Try to create another ad with the same name
      return request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(existingAd)
        .expect(409);
    });

    it('should return 400 when end date is before start date', () => {
      const invalidAd = {
        adsName: 'Invalid Date Ad',
        budget: 1000,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'), // End date before start date
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      return request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(invalidAd)
        .expect(409);
    });

    it('should validate required fields', () => {
      const invalidAd = {
        // Missing required fields
        adsName: 'Test Ad',
        budget: 1000,
      };

      return request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(invalidAd)
        .expect(400);
    });
  });
});
