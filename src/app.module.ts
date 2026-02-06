import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HospitalModule } from './hospital/hospital.module';
import { ConfigModule } from '@nestjs/config';

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
    ConfigModule.forRoot({
      isGlobal: true, // Makes the module available everywhere
      envFilePath: '.env', // Path to your file (default is .env)
    }),
    AuthModule, UserModule, HospitalModule
  ],
  controllers: [AppController],
  providers: [AppService],})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
