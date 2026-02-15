import { Controller, Post, Get, Delete, Patch, Req, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { SessionGuard } from '../auth/session.guard';
import type { HOSPITAL_DATA, UPDATE_HOSPITAL } from './hospital.types';

@Controller('hospital')
export class HospitalController {
    constructor(
        private readonly hospitalServices: HospitalService
    ) {}

    // CREATE
    @UseGuards(SessionGuard)
    @Post("create_hospital")
    async createHospital(
        @Body() createDto: HOSPITAL_DATA, 
        @Req() request: any
    ) {
        return await this.hospitalServices.createHospital(createDto, request.user.id);
    }

    // GET (Single or All)
    @Get()
    async getHospital(
        @Query('id') hospitalId?: string,
        @Query('page') page?: number
    ) {
        return await this.hospitalServices.getHospital(hospitalId, page);
    }

    // UPDATE
    @UseGuards(SessionGuard)
    @Patch("update_hospital")
    async updateHospital(
        @Body() updateDto: UPDATE_HOSPITAL
    ) {
        return await this.hospitalServices.updateHospital(updateDto);
    }

    // DELETE
    @UseGuards(SessionGuard)
    @Delete("delete_hospital/:id")
    async deleteHospital(
        @Param('id') hospitalId: string, 
        @Req() request: any
    ) {
        return await this.hospitalServices.deleteHospital(hospitalId, request.user.id);
    }
}