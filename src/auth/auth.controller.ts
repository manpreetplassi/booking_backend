import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterLocalUserDto, RequestWithUser } from 'src/user/user.types';
import type { Response } from 'express';
import { LoginDto } from './auth.types';
import { AuthGuard } from '@nestjs/passport';

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
    login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): object {
        return this.authService.loginLocalUser(loginDto, response);
    }

    // Route to trigger Google Login
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // This part is unreachable! 
        // Passport handles the redirect to Google automatically.
        // return HttpStatus.OK;
    }

    // Google redirects here after authentication
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
        // This is where you would usually save the user to your database
        // and/or issue a JWT (JSON Web Token)
        return this.authService.loginGoogleUser(req.user, response);
    }

    @Get('signout')
    signOut(@Req() req: any, @Res({ passthrough: true }) response: Response) {
        // This is where you would usually save the user to your database
        // and/or issue a JWT (JSON Web Token)
        return this.authService.signOut();
    }
}
