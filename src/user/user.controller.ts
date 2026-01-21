import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionGuard } from 'src/auth/session.guard';

@Controller('user')
export class UserController {
    constructor(
        private readonly userServices: UserService
    ) { }
    @UseGuards(SessionGuard) // The Guard runs first
    @Get("profile")
    getProfile(@Req() request: any) {
        // The Guard already verified the user and attached them to the request
        return this.userServices.getUserData(request)
    }

}
