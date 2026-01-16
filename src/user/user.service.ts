import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAuth } from './user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterLocalUserDto } from './user.types';

@Injectable()
export class UserService {
    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(UserAuth)
        private userAuthRepo: Repository<UserAuth>
    ) { }
    async createUser(dto: RegisterLocalUserDto): Promise<object> {
        const isUserExist = await this.userRepo.findOne({
            where: { email: dto.email }
        })
        if (isUserExist) {
            throw new ConflictException('Email already registered');
        }
        try {
            await this.dataSource.transaction(async (manager) => {
                // create user
                const user = manager.create(User, {
                    email: dto.email,
                    username: dto.username
                })
                const savedUser = await manager.save(user)

                // password encription
                const saltOrRounds = 10;
                const hashPassword = await bcrypt.hash(dto.credential, saltOrRounds);

                const auth = await manager.create(UserAuth, {
                    providerType: "local",
                    credential: hashPassword,
                    user: savedUser
                })

                await manager.save(auth);
            })
            return { success: true }
        } catch (error) {
            const DUPLICATE_KEY_ERROR_CODE = 23505
            if (error.code == DUPLICATE_KEY_ERROR_CODE) {
                return { message: error.driverError.detail }
            }
            throw new InternalServerErrorException();
        }
    }



}
