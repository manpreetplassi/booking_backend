import { Module } from '@nestjs/common';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './hospital.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hospital])
  ],
  controllers: [HospitalController],
  providers: [HospitalService]
})
export class HospitalModule {}
