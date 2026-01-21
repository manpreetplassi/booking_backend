import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterLocalUserDto } from 'src/user/user.types';
import { LoginDto } from './auth.types';
import { ClientProxy } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { User, UserAuth } from 'src/user/user.entity';
import bcrypt from 'bcrypt'
import { Response } from 'express';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,

        @Inject('REDIS_DB') private readonly redis: Redis, // Inject the "Filing Cabinet"
        
        private readonly dataSource: DataSource,
    ) { }

    async registerNewLocalUser(dto: RegisterLocalUserDto): Promise<object> {
        return await this.userService.createUser(dto);
    }

    async loginLocalUser(loginDto: LoginDto, response: Response): Promise<object> {
        try {
            // 1. Logic to verify user in your MAIN DB (Postgres/MySQL)
            const auth_user = await this.dataSource.transaction(async (manager) => {
                const isExist = await manager.findOne(User, {
                    where: { email: loginDto.email },
                    relations: ['authProviders'] // This tells TypeORM to join the UserAuth table
                })
                if (!isExist) {
                    throw new NotFoundException(`User not found`);
                }
                const isMatch = await bcrypt.compare(loginDto.password, isExist.authProviders[0].credential!)
                if (isMatch) {
                    return isExist;
                } else {
                    throw new UnauthorizedException("Invalid credentials");
                }
            })

            // 2. Create a random Session ID (The "Opaque Token")
            const sessionId = crypto.randomUUID();

            // 3. Emit an event to Redis so other services know user logged in
            
            await this.redis.set(sessionId, auth_user.id.toString(), 'EX', 3600);

            // 4. Send to browser as a SECURE cookie
            response.cookie('session_id', sessionId, {
                httpOnly: true, // JavaScript cannot steal this
                secure: false,  // Set to true in production (HTTPS)
                maxAge: 3600000, // 1 hour
            });
            console.log(sessionId)
            // TODO: what will login api get as an response
            return { message: 'Logged in successfully' };
        } catch (error) {
            return new InternalServerErrorException(error)
        }
    }
}
