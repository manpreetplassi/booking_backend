import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SessionGuard } from 'src/auth/session.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getUserData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getUserData from service', async () => {
    const mockRequest = { user: { id: 'test-user-id' } };
    const mockResponse = { id: 'auth-id', user: { id: 'test-user-id', email: 'test@test.com' } };
    
    mockUserService.getUserData.mockResolvedValue(mockResponse);

    const result = await controller.getProfile(mockRequest);

    expect(userService.getUserData).toHaveBeenCalledWith(mockRequest);
    expect(result).toEqual(mockResponse);
  });
});






// import { Test, TestingModule } from '@nestjs/testing';
// import { UserController } from './user.controller';

// describe('UserController', () => {
//   let controller: UserController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UserController],
//     }).compile();

//     controller = module.get<UserController>(UserController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
