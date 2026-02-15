import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let mockUserRepo: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const manager = {
          create: jest.fn().mockImplementation((entity, dto) => dto),
          save: jest.fn().mockImplementation(async (entity) => entity),
        };
        return cb(manager);
      }),
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser (Local)', () => {
    const dto = { email: 'test@test.com', username: 'testuser', credential: 'password' };

    it('should successfully create a new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.createUser(dto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should throw ConflictException if user already exists in findOne', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if transaction throws duplicate key error', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockRejectedValue({ code: 23505 });

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for other transaction errors', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockDataSource.transaction.mockRejectedValue(new Error('DB Down'));

      await expect(service.createUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createGoogleUser', () => {
    const googleProfile = {
      googleId: 'google-123',
      email: 'google@test.com',
      firstName: 'Google',
      lastName: 'User',
      name: 'Google User',
      picture: 'url',
      accessToken: 'token',
      emailVerified: true,
    };

    it('should successfully create a Google user', async () => {
      const result = await service.createGoogleUser(googleProfile);
      
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual({
        email: 'google@test.com',
        username: 'Google',
        avatar_url: 'url',
      });
    });

    it('should throw ConflictException on duplicate key error', async () => {
      mockDataSource.transaction.mockRejectedValue({ code: 23505 });
      await expect(service.createGoogleUser(googleProfile)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      mockDataSource.transaction.mockRejectedValue(new Error('Unknown'));
      await expect(service.createGoogleUser(googleProfile)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUserData', () => {
    it('should fetch user profile from UserAuth repo', async () => {
      const mockRequest = { user: { id: 'auth-123' } };
      const mockResult = { id: 'auth-123', user: { id: 'user-1' } };
      
      const mockFindOne = jest.fn().mockResolvedValue(mockResult);
      mockDataSource.getRepository.mockReturnValue({ findOne: mockFindOne });

      const result = await service.getUserData(mockRequest);

      expect(mockDataSource.getRepository).toHaveBeenCalled();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { id: 'auth-123' },
        relations: { user: true },
      });
      expect(result).toEqual(mockResult);
    });
  });
});





// import { Test, TestingModule } from '@nestjs/testing';
// import { UserService } from './user.service';

// describe('UserService', () => {
//   let service: UserService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UserService],
//     }).compile();

//     service = module.get<UserService>(UserService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
