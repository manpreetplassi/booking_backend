import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAuth } from './user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GoogleUser, RegisterLocalUserDto } from './user.types';

@Injectable()
export class UserService {
    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(User)
        private userRepo: Repository<User>,

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
                throw new ConflictException('User with this email already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    async createGoogleUser(googleProfile: GoogleUser) {
        try {
            const response = await this.dataSource.transaction(async (manager) => {
                // 1. Create the base User
                const user = manager.create(User, {
                    email: googleProfile.email,
                    username: googleProfile.firstName,
                    avatar_url: googleProfile.picture
                })
                const savedUser = await manager.save(user)

                // 2. Sanitize Metadata: Save only what you might need for debugging/UI
                const sanitizedMetadata = {
                    email_verified: googleProfile.emailVerified,
                    given_name: googleProfile.firstName,
                    family_name: googleProfile.lastName,
                    last_login_at: new Date().toISOString(),
                };

                // 3. Create the Auth link
                const auth = manager.create(UserAuth, {
                    providerType: 'google',
                    providerId: googleProfile.googleId,
                    providerMetadata: sanitizedMetadata, // Clean and focused
                    user: savedUser
                });

                await manager.save(auth);
                return savedUser;
            })
            return response;
            // return { success: true }
        } catch (error) {
            const DUPLICATE_KEY_ERROR_CODE = 23505
            if (error.code == DUPLICATE_KEY_ERROR_CODE) {
                throw new ConflictException('User with this email already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    async getUserData(request: any) {
        const userProfile = await this.dataSource.getRepository(UserAuth)
            .findOne({
                where: { id: request.user.id },
                relations: {
                    user: true
                }
            })
        console.log(userProfile, request.user.id)
        return userProfile;
    }
}
