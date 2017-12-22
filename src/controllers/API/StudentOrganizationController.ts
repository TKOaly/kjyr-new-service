import {
    Controller, Render, Get, Post, Session, Res, Body, Req, Param, Authorized
} from "routing-controllers";
import StudentOrganizations from '../../models/StudentOrganization';
import { Request, Response } from 'express';

import { KJYRSession, KJYRRegistration } from '../../utils/KJYRSession';

@Controller('/api/studorgs')
export default class StudentOrganizationController {

    @Post('/')
    @Authorized('admin')
    async addStudentOrganization( @Session() session: KJYRSession, @Body() studorg: any, @Res() response: Response) {
        let newStudorg = new StudentOrganizations(studorg);
        //newStudorg.createAdminUser(studorg.admin_password);
        return await newStudorg.save();
    }
}