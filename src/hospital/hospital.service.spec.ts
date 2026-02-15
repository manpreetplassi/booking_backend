import { Test, TestingModule } from '@nestjs/testing';
import { HospitalService } from './hospital.service';
import { DataSource } from 'typeorm';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('HospitalService', () => {
  let service: HospitalService;
  let mockDataSource: any;

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn(),
      transaction: jest.fn().mockImplementation(async (cb) => {
        // Mock the manager used inside the transaction
        const manager = { query: jest.fn() };
        // We attach the mock manager to the dataSource object so we can assert on it in our tests
        mockDataSource.manager = manager; 
        return cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<HospitalService>(HospitalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE HOSPITAL ---
  describe('createHospital', () => {
    const createDto = { name: 'Apollo', email: 'apollo@test.com', reg_number: 'REG123', phone: '9999999999' };
    const userId = 'user-123';

    it('should successfully create a hospital', async () => {
      // Setup the transaction mock to return specific values for the manager queries
      mockDataSource.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          query: jest.fn()
            .mockResolvedValueOnce([{ exists: false }]) // First query: EXISTS check
            .mockResolvedValueOnce([{ id: 'hosp-1', ...createDto, owner_id: userId }]) // Second query: INSERT
        };
        return cb(manager);
      });

      const result = await service.createHospital(createDto, userId);
      expect(result).toEqual([{ id: 'hosp-1', ...createDto, owner_id: userId }]);
    });

    it('should throw ConflictException if hospital email/reg_number already exists in transaction', async () => {
      mockDataSource.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          query: jest.fn().mockResolvedValueOnce([{ exists: true }]) // Hospital exists!
        };
        return cb(manager);
      });

      await expect(service.createHospital(createDto, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if duplicate key error (23505) occurs', async () => {
      mockDataSource.transaction.mockRejectedValueOnce({ code: 23505 });
      await expect(service.createHospital(createDto, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockDataSource.transaction.mockRejectedValueOnce(new Error('DB connection lost'));
      await expect(service.createHospital(createDto, userId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- GET HOSPITAL ---
  describe('getHospital', () => {
    it('should return a specific hospital if hospitalId is provided', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'hosp-1', name: 'Apollo' }]);

      const result = await service.getHospital('hosp-1');
      expect(mockDataSource.query).toHaveBeenCalledWith(expect.stringContaining('where id = $1'), ['hosp-1']);
      expect(result).toEqual({ id: 'hosp-1', name: 'Apollo' });
    });

    it('should return null if specific hospital is not found', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // Empty array

      const result = await service.getHospital('hosp-1');
      expect(result).toBeNull();
    });

    it('should return paginated list of hospitals if no hospitalId is provided', async () => {
      const mockHospitals = [{ id: 'hosp-1' }, { id: 'hosp-2' }];
      mockDataSource.query.mockResolvedValueOnce(mockHospitals);

      const result = await service.getHospital(undefined, 1);
      
      // limit is 10, offset is page(1) * 10 = 10
      expect(mockDataSource.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1 OFFSET $2'), [10, 10]);
      expect(result).toEqual(mockHospitals);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('DB Error'));
      await expect(service.getHospital()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- DELETE HOSPITAL ---
  describe('deleteHospital', () => {
    it('should successfully delete a hospital', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'hosp-1' }]);

      const result = await service.deleteHospital('hosp-1', 'user-123');
      expect(result).toEqual({ message: 'Hospital deleted successfully' });
    });

    it('should throw NotFoundException if hospital not found', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // Empty array indicates nothing was deleted

      await expect(service.deleteHospital('hosp-1', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('DB Error'));
      await expect(service.deleteHospital('hosp-1', 'user-123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- UPDATE HOSPITAL ---
  describe('updateHospital', () => {
    it('should return "nothing to update" if dto is empty', async () => {
      const result = await service.updateHospital({ hospitalId: 'hosp-1' });
      expect(result).toEqual({ message: 'nothing to update' });
      expect(mockDataSource.query).not.toHaveBeenCalled();
    });

    it('should successfully update a hospital', async () => {
      const updateDto = { hospitalId: 'hosp-1', name: 'New Apollo', phone: '1234567890' };
      const updatedRecord = { id: 'hosp-1', name: 'New Apollo', phone: '1234567890' };
      
      mockDataSource.query.mockResolvedValueOnce([updatedRecord]);

      const result = await service.updateHospital(updateDto);
      
      // Values should be [name, phone, hospitalId] -> ['New Apollo', '1234567890', 'hosp-1']
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE hospital set name = $1, phone = $2 where id = $3 RETURNING *'),
        ['New Apollo', '1234567890', 'hosp-1']
      );
      expect(result).toEqual(updatedRecord);
    });

    it('should throw NotFoundException if hospital to update is not found', async () => {
      const updateDto = { hospitalId: 'hosp-1', name: 'New Apollo' };
      mockDataSource.query.mockResolvedValueOnce([]); // Empty array returned

      await expect(service.updateHospital(updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      const updateDto = { hospitalId: 'hosp-1', name: 'New Apollo' };
      mockDataSource.query.mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.updateHospital(updateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { HospitalService } from './hospital.service';

// describe('HospitalService', () => {
//   let service: HospitalService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [HospitalService],
//     }).compile();

//     service = module.get<HospitalService>(HospitalService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
