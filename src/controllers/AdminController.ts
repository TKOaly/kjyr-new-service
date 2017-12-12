import { Controller, Render, Get, Post, Session, Redirect, Body, Req, UseBefore, Res } from "routing-controllers";
import StudentOrganizations from '../models/StudentOrganization';
import Person from '../models/Person';
import Preference from '../models/Preference';
import Cruise from '../models/Cruise';
import Cabin from '../models/Cabin';

@Controller('/admin')
export default class UserController {

  @Get('/')
  @Render('admin')
  async getAdminView( @Session() session: any, @Res() response: any) {
    if (!session.role) {
      return response.redirect('/login');
    }

    if (session.role === 'admin') {
      let cabins = await Cabin.findAll({ include: [Person] });
      let preferences = await Preference.findAll();
      let cruise = await Cruise.findOne() || {};
      let studOrgs = await StudentOrganizations.findAll();
      return {
        cabins,
        preferences,
        cruise,
        jsEnabled: true,
        studOrgs,
        config: global.Backend.Config,
        adminMessage: '',
        userLanguage: session.lang,
        isAdmin: session.role === 'admin',
        locale: global.Backend.Localization[session.lang || 'fi']
      }
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
  }

}