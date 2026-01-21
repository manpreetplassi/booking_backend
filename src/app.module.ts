import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', 
      port: 5432,
      username: 'user123',
      password: 'password123',
      database: 'my_database',
      // entities: [],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule, UserModule
  ],
  controllers: [AppController],
  providers: [AppService],})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
