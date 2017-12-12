import { Controller, Render, Get, Post, Session, Redirect, Body, Req, UseBefore } from "routing-controllers";
import StudentOrganizations from '../models/StudentOrganization';
import Admin from '../models/Admin';

const bcrypt = require('bcrypt');

@Controller('/login')
export default class UserController {

  @Get('/')
  @Render('login')
  async getAdminView( @Session() session: any) {
    if (session.role) {
      return '/admin';
    }
    return {
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || 'fi']
    }
  }

  @Post('/')
  @Redirect('/admin')
  async login( @Body() body: any, @Req() request: any) {
    let username = body.username;
    let password = body.passwd;
    let adminUser =  await Admin.find({ where: { username }, include: [StudentOrganizations] });
    if (bcrypt.compareSync(password, adminUser.passwordSalt)) {
      request.session.role = adminUser.isAdmin ? 'admin' : 'studorg';
      request.session.studentOrganization = adminUser.studentOrganization;
    }
  }

}