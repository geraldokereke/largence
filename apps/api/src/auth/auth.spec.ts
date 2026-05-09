import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { OrgType } from '@prisma/client';

describe('Auth (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new organisation and user', async () => {
      const dto = {
        email: 'admin@testlaw.com',
        password: 'Password123!!',
        firstName: 'John',
        lastName: 'Doe',
        orgName: 'Test Law Firm',
        orgType: OrgType.LAW_FIRM,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Host', 'app.largence.com')
        .send(dto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('orgSlug');
      expect(response.body.orgSlug).toContain('test-law-firm');
    });
  });

  describe('Tenant Resolution', () => {
    it('should return 404 for unknown organisation subdomain', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Host', 'unknown.largence.com')
        .send({ email: 'test@test.com', password: 'password' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('ORGANISATION_NOT_FOUND');
    });
  });
});
