import { Controller, Render, Get, Post, Session, Redirect, Body, Req, UseBefore } from "routing-controllers";
import StudentOrganizations from '../models/StudentOrganization';
import Person from '../models/Person';

import { KJYRSession, KJYRRegistration } from '../utils/KJYRSession';

const bcrypt = require('bcrypt');

@Controller('/signup')
export default class UserController {

  @Get('/:step')
  @Render('ilmo')
  async getAdminView( @Session() session: KJYRSession) {
    if (session.auth && session.auth.role) {
      return '/admin';
    }
    return {
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || 'fi']
    }
  }


}