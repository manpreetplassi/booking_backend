import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterLocalUserDto } from 'src/user/user.types';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) { }

    async registerNewLocalUser(dto: RegisterLocalUserDto): Promise<object> {
        return await this.userService.createUser(dto);
    }
}
