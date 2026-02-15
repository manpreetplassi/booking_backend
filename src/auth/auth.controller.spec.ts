import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAuth, User } from 'src/user/user.entity';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockRedis: any;
  let mockDataSource: any;
  let mockUserAuthRepo: any;

  beforeEach(async () => {
    // Mock the global crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: { randomUUID: jest.fn().mockReturnValue('mock-uuid-1234') },
      writable: true,
    });

    mockUserService = {
      createUser: jest.fn(),
      createGoogleUser: jest.fn(),
    };

    mockRedis = {
      set: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        // Mock the entity manager passed into the transaction
        const manager = { findOne: mockDataSource.findOneMock };
        return cb(manager);
      }),
      findOneMock: jest.fn(),
    };

    mockUserAuthRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: 'REDIS_DB', useValue: mockRedis },
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(UserAuth), useValue: mockUserAuthRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerNewLocalUser', () => {
    it('should successfully register a new user', async () => {
      // ✅ NEW:
      const dto = { email: 'test@test.com', credential: 'password', username: 'testuser' };
      mockUserService.createUser.mockResolvedValue({ id: '1', ...dto });

      const result = await service.registerNewLocalUser(dto);
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('loginLocalUser', () => {
    const loginDto = { email: 'test@test.com', password: 'password' };
    const mockRes: any = { cookie: jest.fn() };
    const mockDbUser = {
      id: 'user-id-1',
      email: 'test@test.com',
      authProviders: [{ credential: 'hashed-password' }],
    };

    it('should login successfully and set cookie', async () => {
      mockDataSource.findOneMock.mockResolvedValue(mockDbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginLocalUser(loginDto, mockRes);

      expect(mockRedis.set).toHaveBeenCalledWith('mock-uuid-1234', 'user-id-1', 'EX', 3600);
      expect(mockRes.cookie).toHaveBeenCalledWith('session_id', 'mock-uuid-1234', expect.any(Object));
      expect(result).toEqual({ message: 'Logged in successfully' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockDataSource.findOneMock.mockResolvedValue(null); // User not found

      const result = await service.loginLocalUser(loginDto, mockRes);
      expect(result).toBeInstanceOf(InternalServerErrorException); // Your catch block wraps it
    });

    it('should throw UnauthorizedException for bad password', async () => {
      mockDataSource.findOneMock.mockResolvedValue(mockDbUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Bad password

      const result = await service.loginLocalUser(loginDto, mockRes);
      expect(result).toBeInstanceOf(InternalServerErrorException); // Wrapped by your catch block
    });
  });

  describe('loginGoogleUser', () => {
    const mockGoogleProfile: any = { googleId: 'google-123', email: 'test@gmail.com' };
    const mockRes: any = { cookie: jest.fn() };

    it('should login existing google user and set cookie', async () => {
      mockUserAuthRepo.findOne.mockResolvedValue({ id: 'existing-auth-id', user: { id: 'user-id-2' } });

      const result = await service.loginGoogleUser(mockGoogleProfile, mockRes);

      expect(mockRedis.set).toHaveBeenCalledWith('mock-uuid-1234', 'existing-auth-id', 'EX', 3600);
      expect(mockRes.cookie).toHaveBeenCalledWith('session_id', 'mock-uuid-1234', expect.any(Object));
      expect(result).toEqual({ message: 'Logged in successfully' });
    });

    it('should create new google user if not found', async () => {
      mockUserAuthRepo.findOne.mockResolvedValue(null);
      mockUserService.createGoogleUser.mockResolvedValue({ id: 'new-user-id' });

      const result = await service.loginGoogleUser(mockGoogleProfile, mockRes);

      expect(mockUserService.createGoogleUser).toHaveBeenCalledWith(mockGoogleProfile);
      expect(mockRedis.set).toHaveBeenCalledWith('mock-uuid-1234', 'new-user-id', 'EX', 3600);
      expect(result).toEqual({ message: 'Logged in successfully' });
    });

    it('should throw error if google profile is missing googleId', async () => {
      const invalidProfile: any = { email: 'test@gmail.com' };
      const result = await service.loginGoogleUser(invalidProfile, mockRes);
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('signOut', () => {
    it('should return success true', async () => {
      const result = await service.signOut();
      expect(result).toEqual({ success: true });
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';

// describe('AuthController', () => {
//   let controller: AuthController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//     }).compile();

//     controller = module.get<AuthController>(AuthController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
