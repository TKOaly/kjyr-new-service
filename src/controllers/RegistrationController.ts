import { Controller, Render, Get, Post, Session, Redirect, Body, Req, Param } from "routing-controllers";
import StudentOrganizations from '../models/StudentOrganization';
import Person from '../models/Person';
import Preference from '../models/Preference';
import Cabin from '../models/Cabin';

import { KJYRSession, KJYRRegistration } from '../utils/KJYRSession';

@Controller('/signup')
export default class RegistrationController {

  @Get('/')
  @Redirect('/signup/:step')
  signupRoot( @Session() session: KJYRSession) {
    if (!session.registration) {
      session.registration = new KJYRRegistration();
      session.registration.step = 1;
    }
    return {
      step: session.registration.step
    };
  }

  @Get('/:step')
  @Render('signup')
  async getSignup( @Session() session: KJYRSession, @Param('step') step: number) {
    if (!session.registration) {
      session.registration = new KJYRRegistration();
      session.registration.step = 1;
    }
    if (step > session.registration.step) {
      return '/signup/' + session.registration.step;
    }
    let registrationStepParameters = await this.getRegistrationStepParams(step, session);
    return Object.assign({
      nStep: session.registration.step,
      person: session.registration.person,
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || 'fi']
    }, registrationStepParameters);
  }

  async getRegistrationStepParams(step: number, session: KJYRSession): Promise<any> {
    let params = {
      1: async () => {
        return {
          studorgs: await StudentOrganizations.findAll()
        }
      },
      2: {},
      3: async () => {
        (
          {
            preferences: await Preference.findAll()
          }
        )
      },
      4: async () => {
        (
          {
            cabins: await Cabin.findAll({ where: { studOrgId: session.registration.person.studOrgId }, include: [Person] })
          }
        )
      },
      5: async () => {
        (
          {
            studorgs: session.registration.person.studentOrganization
          }
        )
      }
    };
    return await params[step]();
  }

  @Post('/selectStudorg')
  @Redirect('/signup')
  selectStudorg(@Session() session: KJYRSession, @Body() body: any) {
    if (body.studorg) {
      session.registration.person.studOrgId = body.studorg;
      session.registration.step = 2;
    }
  }
}