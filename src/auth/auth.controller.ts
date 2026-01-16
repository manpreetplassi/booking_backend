import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterLocalUserDto } from 'src/user/user.types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("sign_up") // /auth/sign_up
    registerUser(@Body() createUserDto: RegisterLocalUserDto): object{
        return this.authService.registerNewLocalUser(createUserDto);
    }
}
