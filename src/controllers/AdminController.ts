import { Controller, Render, Get, Post, Session, Redirect, Body, Req, UseBefore, Res, RedirectOrRender } from 'routing-controllers';
import StudentOrganization from '../models/StudentOrganization';
import Person from '../models/Person';
import Preference from '../models/Preference';
import Cruise from '../models/Cruise';
import Cabin from '../models/Cabin';
import { KJYRSession, KJYRAuth } from '../utils/KJYRSession';

import * as express from 'express';

/**
 * Controlls actions in the admin view.
 */


@Controller('/admin')
export default class AdminController {

  @Get('/')
  @RedirectOrRender('admin')
  async getAdminView( @Session() session: KJYRSession, @Res() response: express.Response) {
    if (!session.auth || !session.auth.role) {
      return '/login';
    } else {
      if (session.auth.role === 'admin') {
        // Fetch basically all data of the cruise.
        let cabins = await Cabin.findAll({ include: [Person] });
        let preferences = await Preference.findAll();
        let cruise = await Cruise.findOne() || {};
        let studOrgs = await StudentOrganization.findAll();
        return {
          cabins,
          preferences,
          cruise,
          jsEnabled: true,
          studOrgs,
          config: global.Backend.Config,
          adminMessage: '',
          userLanguage: session.lang,
          isAdmin: session.auth.role === 'admin',
          locale: global.Backend.Localization[session.lang || 'fi']
        };
      }
    }
  }
}