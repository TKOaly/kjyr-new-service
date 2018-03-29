import {
    Render, Get, Post, Session, Res, Body, Req, Param, Authorized, JsonController, Redirect
} from 'routing-controllers';
import { Request, Response } from 'express';

import { KJYRSession, KJYRRegistration } from '../../utils/KJYRSession';
import StudentOrganization from "../../models/StudentOrganization";

@JsonController('/api/studorgs')
export default class StudentOrganizationController {
    @Post('/')
    @Authorized('admin')
    @Redirect('/admin')
    async addStudentOrganization(@Session() session: KJYRSession, @Body() studorg: any, @Res() response: Response) {
        let newStudorg = new StudentOrganization(studorg);
        newStudorg.createAdminUser(studorg.admin_password);
        try {
            await newStudorg.save();
        } catch (e) {
            return '/admin'
        }
    }

    @Post('/:id/delete')
    @Authorized('admin')
    @Redirect('/admin')
    deleteStudorg(@Param('id') id: number) {
        StudentOrganization.destroy({ where: { id } });
    }

    @Post('/:id')
    @Authorized('admin')
    @Redirect('/admin')
    async updateStudorg(@Body() studorg: any, @Param('id') id: number) {
        StudentOrganization.update(studorg, { where: { id } });
    }
}