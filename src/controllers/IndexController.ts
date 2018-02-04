import { Controller, Render, Get, Post, Session, Redirect, Body, Req, UseBefore } from 'routing-controllers';
import * as express from 'express';
import StudentOrganization from '../models/StudentOrganization';
import Person from '../models/Person';

@Controller()
export default class LoginController {

  @Get('/')
  @Render('index')
  async getIndex( @Session() session: any) {
    let studorgs = await StudentOrganization.findAll();
    let participants = await Person.count();
    let stats = {
      studorgs: studorgs.length,
      participants
    };
    return {
      studOrgs: studorgs,
      stats,
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || 'fi']
    }
  }

  @Post('/')
  @Redirect('/')
  postIndex( @Body() body: any, @Req() request: express.Request) {
    request.session.lang = body.languageSelect;
    return request.headers.referer;
  }

}