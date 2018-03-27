import { Controller, Render, Get, Post, Session, Redirect, Body, Req, UseBefore } from 'routing-controllers';
import StudentOrganizations from '../models/StudentOrganization';
import Admin from '../models/Admin';

import { KJYRSession, KJYRAuth } from '../utils/KJYRSession';

import * as bcrypt from 'bcrypt';
/**
 * Controller for handling login actions to the admin control panel
 */

@Controller('/login')
export default class LoginController {

  @Get('/')
  @Render('login')
  getAdminView( @Session() session: KJYRSession) {
    if (session.auth && session.auth.role) {
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
  async login( @Session() session: KJYRSession, @Body() body: any) {
    let username = body.username;
    let password = body.passwd;
    let adminUser =  await Admin.find({ where: { username }, include: [StudentOrganizations] });
    // Check the password hashes.
    if (bcrypt.compareSync(password, adminUser.passwordSalt)) {
      session.auth = new KJYRAuth(adminUser.isAdmin ? 'admin' : 'studorg', adminUser.studentOrganization);
    }
  }

}