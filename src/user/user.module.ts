import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAuth } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAuth])
  ],
  exports: [UserModule, UserService],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {

}
