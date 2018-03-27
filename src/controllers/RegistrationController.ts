import { Controller, Render, Get, Post, Session, Redirect, Body, Req, Param, Res, UseBefore, RedirectOrRender } from 'routing-controllers';
import StudentOrganizations from '../models/StudentOrganization';
import Person from '../models/Person';
import Preference from '../models/Preference';
import Cabin from '../models/Cabin';

import * as moment from 'moment';

import { KJYRSession, KJYRRegistration, flashMessage } from '../utils/KJYRSession';
import SessionMessageHandler from '../utils/SessionMessageHandler';
import LocalizedInputError from '../utils/LocalizedInputError';

/**
 * This controller is the main entrypoint for everything related to the signup process.
 */

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
  @RedirectOrRender('signup')
  async getSignup( @Session() session: KJYRSession, @Param('step') step: number, @Res() res: any) {
    if (!session.registration) {
      session.registration = new KJYRRegistration();
      session.registration.step = 1;
    }
    if (step > session.registration.step) {
      return '/signup';
    }
    let registrationStepParameters = await this.getRegistrationStepParams(step, session);
    return res.render('signup', Object.assign({
      nStep: session.registration.step,
      person: session.registration.person,
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || 'fi'],
      message: session.message
    }, registrationStepParameters));
  }

  // Vittu mikä systeemi :DD
  async getRegistrationStepParams(step: number, session: KJYRSession): Promise<any> {
    let params = {
      1: async () => {
        return {
          studorgs: await StudentOrganizations.findAll()
        }
      },
      2: async () => {(
        {
          person: session.registration.person
        }
      )},
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
            studorgs: session.registration.person.studentOrganization,
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
      if (!session.registration.person) {
        session.registration.person = new Person();
      }
      session.registration.person.studOrgId = body.studorg;
      session.registration.step = 2;
    }
  }

  @Post('/addPersonDetails')
  @Redirect('/signup')
  async addPersonDetails(@Session() session: KJYRSession, @Body() body: any, @Req() request) {
    if (!body.birthDate) {
      body.birthDate = moment(`${body.month}-${body.day}-${body.year}`, 'MM-DD-YYYY').toDate();
    }
    let person = new Person(body);
    session.registration.person = person;
    try {
      await person.validate();
    } catch (error) {
      // Check that the 'errors' array isn't empty
      let localizedInputError = new LocalizedInputError(error.errors[0].message.errorKey);
      flashMessage(request.session, 'danger', localizedInputError.getLocalizedErrorMessage(session.lang));
    }
  }
}