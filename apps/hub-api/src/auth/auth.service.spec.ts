import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PhoneHashService } from '../phone/phone-hash.service';

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  phone: '+84901234567',
  passwordHash: bcrypt.hashSync('password123', 1),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockPhone = {
  normalize: jest.fn().mockImplementation((p: string) => p.startsWith('+') ? p : `+84${p.slice(1)}`),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PhoneHashService, useValue: mockPhone },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') } },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates user and returns token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPhone.normalize.mockReturnValue('+84901234567');

      const result = await service.register({
        name: 'Test User', phone: '0901234567', password: 'password123',
      });

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user.phone).toBe('+84901234567');
    });

    it('throws ConflictException for duplicate phone', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({ name: 'Test', phone: '0901234567', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPhone.normalize.mockReturnValue('+84901234567');

      const result = await service.login({ phone: '0901234567', password: 'password123' });

      expect(result.access_token).toBe('mock.jwt.token');
    });

    it('throws UnauthorizedException for unknown phone', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ phone: '0999999999', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ phone: '0901234567', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
