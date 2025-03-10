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

  describe('GET /api/v1/advertisements', () => {
    it('should return all advertisements', async () => {
      // First create some test advertisements
      const testAds = [
        {
          adsName: 'Test Ad 1',
          budget: 1000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          targetAudience: 'Young Adults',
          locations: ['New York'],
          creativeType: CreativeType.Image,
          creativeURL: 'https://example.com/image1.jpg',
        },
        {
          adsName: 'Test Ad 2',
          budget: 2000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          targetAudience: 'Adults',
          locations: ['Los Angeles'],
          creativeType: CreativeType.Video,
          creativeURL: 'https://example.com/video1.mp4',
        },
      ];

      // Create the test advertisements
      for (const ad of testAds) {
        await request(app.getHttpServer())
          .post('/api/v1/advertisements')
          .send(ad)
          .expect(201);
      }

      // Test getting all advertisements
      return request(app.getHttpServer())
        .get('/api/v1/advertisements')
        .expect(200)
        .expect((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(2);
          expect(response.body[0]).toHaveProperty('adsName');
          expect(response.body[1]).toHaveProperty('adsName');
        });
    });
  });

  describe('GET /api/v1/advertisements/:id', () => {
    it('should return a specific advertisement', async () => {
      // First create a test advertisement
      const newAd = {
        adsName: 'Test Ad for Get By ID',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      // Create the advertisement and get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(newAd)
        .expect(201);

      const createdId = createResponse.body._id;

      // Test getting the specific advertisement
      return request(app.getHttpServer())
        .get(`/api/v1/advertisements/${createdId}`)
        .expect(200)
        .expect((response) => {
          expect(response.body._id).toBe(createdId);
          expect(response.body.adsName).toBe(newAd.adsName);
          expect(response.body.budget).toBe(newAd.budget);
          expect(response.body.targetAudience).toBe(newAd.targetAudience);
        });
    });

    it('should return 404 for non-existent advertisement', () => {
      return request(app.getHttpServer())
        .get('/api/v1/advertisements/nonexistentid')
        .expect(404);
    });
  });

  describe('PUT /api/v1/advertisements/:id', () => {
    it('should update an existing advertisement', async () => {
      // First create a test advertisement
      const newAd = {
        adsName: 'Test Ad for Update',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      // Create the advertisement
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(newAd)
        .expect(201);

      const createdId = createResponse.body._id;

      // Update data
      const updateData = {
        ...newAd,
        adsName: 'Updated Test Ad',
        budget: 2000,
        targetAudience: 'Adults',
      };

      // Test updating the advertisement
      return request(app.getHttpServer())
        .put(`/api/v1/advertisements/${createdId}`)
        .send(updateData)
        .expect(200)
        .expect((response) => {
          expect(response.body._id).toBe(createdId);
          expect(response.body.adsName).toBe(updateData.adsName);
          expect(response.body.budget).toBe(updateData.budget);
          expect(response.body.targetAudience).toBe(updateData.targetAudience);
        });
    });

    it('should return 404 for updating non-existent advertisement', () => {
      const updateData = {
        adsName: 'Non-existent Ad',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      return request(app.getHttpServer())
        .put('/api/v1/advertisements/nonexistentid')
        .send(updateData)
        .expect(404);
    });

    it('should return 409 when updating with existing name', async () => {
      // Create first advertisement
      const firstAd = {
        adsName: 'First Ad',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      await request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(firstAd)
        .expect(201);

      // Create second advertisement
      const secondAd = {
        ...firstAd,
        adsName: 'Second Ad',
      };

      const secondAdResponse = await request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(secondAd)
        .expect(201);

      // Try to update second ad with first ad's name
      const updateData = {
        ...secondAd,
        adsName: 'First Ad',
      };

      return request(app.getHttpServer())
        .put(`/api/v1/advertisements/${secondAdResponse.body._id}`)
        .send(updateData)
        .expect(409);
    });
  });

  describe('DELETE /api/v1/advertisements/:id', () => {
    it('should delete an existing advertisement', async () => {
      // First create a test advertisement
      const newAd = {
        adsName: 'Test Ad for Deletion',
        budget: 1000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Young Adults',
        locations: ['New York'],
        creativeType: CreativeType.Image,
        creativeURL: 'https://example.com/image.jpg',
      };

      // Create the advertisement
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/advertisements')
        .send(newAd)
        .expect(201);

      const createdId = createResponse.body._id;

      // Delete the advertisement
      await request(app.getHttpServer())
        .delete(`/api/v1/advertisements/${createdId}`)
        .expect(204);

      // Verify the advertisement no longer exists
      await request(app.getHttpServer())
        .get(`/api/v1/advertisements/${createdId}`)
        .expect(404);
    });

    it('should return 404 for deleting non-existent advertisement', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/advertisements/nonexistentid')
        .expect(404);
    });
  });
});
