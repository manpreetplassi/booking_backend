import { Test, TestingModule } from '@nestjs/testing';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { SessionGuard } from '../auth/session.guard';

describe('HospitalController', () => {
  let controller: HospitalController;
  let service: HospitalService;

  // 1. Create a mock version of the HospitalService
  const mockHospitalService = {
    createHospital: jest.fn(),
    getHospital: jest.fn(),
    updateHospital: jest.fn(),
    deleteHospital: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HospitalController],
      providers: [
        {
          provide: HospitalService,
          useValue: mockHospitalService, // Inject the mock instead of the real service
        },
      ],
    })
      // Override the SessionGuard so it doesn't block our test requests
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<HospitalController>(HospitalController);
    service = module.get<HospitalService>(HospitalService);
  });

  // --- TESTS ---

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createHospital service with correct DTO and user ID', async () => {
    const dto = { name: 'Apollo', email: 'apollo@test.com', reg_number: '123', phone: '9999999999' };
    const req = { user: { id: 'owner123' } };
    
    mockHospitalService.createHospital.mockResolvedValue({ id: 'h1', ...dto });

    const result = await controller.createHospital(dto, req);

    expect(service.createHospital).toHaveBeenCalledWith(dto, 'owner123');
    expect(result).toEqual({ id: 'h1', ...dto });
  });

  it('should call getHospital service with correct query params', async () => {
    const mockResult = [{ id: 'h1', name: 'Apollo' }];
    mockHospitalService.getHospital.mockResolvedValue(mockResult);

    const result = await controller.getHospital('h1', 1);

    expect(service.getHospital).toHaveBeenCalledWith('h1', 1);
    expect(result).toEqual(mockResult);
  });

  it('should call updateHospital service with correct DTO', async () => {
    const updateDto = { hospitalId: 'h1', name: 'New Apollo' };
    mockHospitalService.updateHospital.mockResolvedValue(updateDto);

    const result = await controller.updateHospital(updateDto);

    expect(service.updateHospital).toHaveBeenCalledWith(updateDto);
    expect(result).toEqual(updateDto);
  });

  it('should call deleteHospital service with correct ID and owner ID', async () => {
    const req = { user: { id: 'owner123' } };
    mockHospitalService.deleteHospital.mockResolvedValue({ message: 'Hospital deleted successfully' });

    const result = await controller.deleteHospital('h1', req);

    expect(service.deleteHospital).toHaveBeenCalledWith('h1', 'owner123');
    expect(result).toEqual({ message: 'Hospital deleted successfully' });
  });
});
// import { Test, TestingModule } from '@nestjs/testing';
// import { HospitalController } from './hospital.controller';

// describe('HospitalController', () => {
//   let controller: HospitalController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [HospitalController],
//     }).compile();

//     controller = module.get<HospitalController>(HospitalController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
