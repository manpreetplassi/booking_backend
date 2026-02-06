import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HOSPITAL_DATA } from './hospital.types';
import { User } from 'src/user/user.entity';

@Injectable()
export class HospitalService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    async createHospital(dto: HOSPITAL_DATA) {
        try {
            const response = await this.dataSource.transaction(async (manager) => {
                const isExist = await manager.exists(User, {
                    where: { email: "ok@gmail.com" }
                })
            })
        } catch (error) {
            const DUPLICATE_KEY_ERROR_CODE = 23505
            if (error.code == DUPLICATE_KEY_ERROR_CODE) {
                throw new ConflictException('User with this email already exists');
            }
            throw new InternalServerErrorException();
        }

    }

}
