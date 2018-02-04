import {
    Render, Get, Post, Session, Res, Body, Req, Param, Authorized, JsonController
} from "routing-controllers";
import { Request, Response } from 'express';

import { KJYRSession, KJYRRegistration } from '../../utils/KJYRSession';
import StudentOrganization from "../../models/StudentOrganization";

@JsonController('/api/studorgs')
export default class StudentOrganizationController {
    @Post('/')
    @Authorized('admin')
    async addStudentOrganization( @Session() session: KJYRSession, @Body() studorg: any, @Res() response: Response) {
        let newStudorg = new StudentOrganization(studorg);
        newStudorg.createAdminUser(studorg.admin_password);
        return '/admin';
    }
}