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
      nStep: step,
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
          studorgs: await StudentOrganizations.findAll({
            where: {
              ilmoStart: {
                $lte: new Date()
              }
            }
          })
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
  async selectStudorg(@Session() session: KJYRSession, @Body() body: any) {
    if (body.studorg) {
      if (!session.registration.person) {
        session.registration.person = new Person();
      }
      let studorg = await StudentOrganizations.findOne({where: { id: body.studorg }, attributes: ['ilmoStart']});

      // User tried signing up to a student organization that doesn't exsist
      if (!studorg) {
        flashMessage(session, 'danger', 'Student organization doesn\'t exsist');
        return '/signup';
      }

      // User tried signing up to a student organization where the signup is still closed
      if (studorg.ilmoStart.getTime() > Date.now()) {
        flashMessage(session, 'danger', 'Signup not yet open');
        return '/signup';
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
    person.studOrgId = session.registration.person.studOrgId
    session.registration.person = person;
    try {
      await person.validate({
        skip: ['cabinId'] // Cabin is chosen later
      });
    } catch (error) {
      // Check that the 'errors' array isn't empty
      if (error.errors.size != 0) {
        let errorString = error.errors.map(err => (err.message + '</br>'));
        flashMessage(request.session, 'danger', errorString);
        return '/signup';
      }
    }
    session.registration.step = 3;
  }

  @Post('/addPersonPrefs')
  @Redirect('signup')
  async addPersonPrefs(@Session() session: KJYRSession, @Body() body: any) {
    
  } 
}