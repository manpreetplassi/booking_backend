import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HOSPITAL_DATA, UPDATE_HOSPITAL } from './hospital.types';

@Injectable()
export class HospitalService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    async createHospital(createDto: HOSPITAL_DATA, userId: string) {
        try {
            const response = await this.dataSource.transaction(async (manager) => {
                const isExist = await manager.query(
                    `SELECT EXISTS(select 1 from hospital 
                        where email = $1 or reg_number = $2)`
                    , [
                        createDto.email,
                        createDto.reg_number
                    ]
                )
                if (isExist[0].exists) {
                    throw new ConflictException('User with this email already exists');
                }
                return await manager.query(
                    `INSERT INTO hospital (name, email, phone, reg_number, owner_id)
                    Values ( $1, $2, $3, $4, $5 ) RETURNING *`,
                    [
                        createDto.name,
                        createDto.email,
                        createDto.phone,
                        createDto.reg_number,
                        userId,
                    ]
                )
            })
            return response; // add error handling in there
        } catch (error) {
            const DUPLICATE_KEY_ERROR_CODE = 23505
            if (error.code == DUPLICATE_KEY_ERROR_CODE) {
                throw new ConflictException('User with this email already exists');
            }
            throw new InternalServerErrorException();
        }

    }

    async getHospital(hospitalId?: string, page: number = 0) {
        const offset = page * 10;
        const limit = 10
        try {
            if (hospitalId) {
                const result = await this.dataSource.query(
                    `SELECT * FROM hospital 
                        where id = $1`, [hospitalId]
                )
                return result[0] || null
            }

            return await this.dataSource.query(
                `SELECT * FROM hospital
                LIMIT $1 OFFSET $2`, [limit, offset]
            )
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async deleteHospital(hospitalId: string, ownerId: string) {
        try {
            const response = await this.dataSource.query(
                `DELETE FROM hospital where id = $1 AND owner_id = $2 RETURNING id`, [hospitalId, ownerId]
            )
            if (response.length == 0) {
                throw new NotFoundException("hospital not found")
            }
            return { message: 'Hospital deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async updateHospital(updateDto: UPDATE_HOSPITAL) {
        const { hospitalId, ...dtoToUpdate } = updateDto
        const keys = Object.keys(dtoToUpdate) // It creates a list of all property names (keys) from an object.
        if (keys.length == 0) return { message: "nothing to update" }

        const setClouse = keys.map((key, index) =>
            `${key} = $${index + 1}`
        ).join(', ')
        const values = Object.values(dtoToUpdate) //It creates a list of all data values stored inside an object.
        values.push(hospitalId)
        const query = `UPDATE hospital set ${setClouse} where id = $${values.length} RETURNING *`
        try {
            const response = await this.dataSource.query(query, values)
            if (response.length === 0) {
                throw new NotFoundException('Hospital not found');
            }
            return response[0]
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

}
