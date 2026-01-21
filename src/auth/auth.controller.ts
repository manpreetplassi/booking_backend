import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterLocalUserDto } from 'src/user/user.types';
import type { Response } from 'express';
import { LoginDto } from './auth.types';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post("sign_up") // /auth/sign_up
    registerUser(@Body() createUserDto: RegisterLocalUserDto): object {
        return this.authService.registerNewLocalUser(createUserDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto, @Res({passthrough: true}) response: Response): object {
        return this.authService.loginLocalUser(loginDto, response);
    }
}
