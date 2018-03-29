import {
  Render, Get, Post, Session, Res, Body, Req, Param, Authorized, JsonController, Redirect
} from 'routing-controllers';
import { Request, Response } from 'express';

import { KJYRSession, KJYRRegistration, flashMessage } from '../../utils/KJYRSession';
import StudentOrganization from "../../models/StudentOrganization";

@JsonController('/api/studorgs')
export default class StudentOrganizationController {
  @Post('/')
  @Authorized('admin')
  @Redirect('/admin')
  async addStudentOrganization(@Session() session: KJYRSession, @Body() studorg: any, @Res() response: Response) {
    let newStudorg = new StudentOrganization(studorg);
    newStudorg.quota = newStudorg.cabinQuota * 4;
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
  async updateStudorg( @Session() session: KJYRSession, @Body() studorg: any, @Param('id') id: number) {
    try {
      await StudentOrganization.update(studorg, { where: { id } });
      flashMessage(session, 'success', 'Student organization updated');
    } catch(error) {
      flashMessage(session, 'danger', error.errors ? error.errors.map(err => err.message) : error.message);
    }
  }
}