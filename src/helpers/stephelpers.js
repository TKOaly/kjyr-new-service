// Module that handles steps
const localization = require('../config/localization.json');
const Person = require('../models/person');
const moment = require('moment');
const CabinReservationSystem = require('../service/CabinReservationSystem');
const cabinReservationSystem = new CabinReservationSystem();
const createInfomail = require('../service/confirmationEmail');

const respond = require('../utils/response').stepResponse;

/**
 * This module is called by ilmohandler.js
 */
module.exports = {
  /**
   * Defines a map of functions that handles get request to /ilmo.
   * The key for each function is the step number.
   */
  get: {
    /**
     * Tells the user to pick a student organization
     */
    1: (req, res) => {
      Backend.Dao.studorg.findAll({
        attributes: ['name', 'id', 'ilmo_start']
      }).then(studorgs => {
        res.render('signup', {
          studorgs: studorgs.map(elem => elem.dataValues),
          nStep: 1,
          message: req.session.message ? req.session.message.value : null,
          config: Backend.Config,
          userLanguage: req.session.lang,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
        });
      });
    },
    /**
     * Tells the user to enter required information
     */
    2: (req, res) => {
      if (!req.session.registration.studOrg) {
        res.redirect('/ilmo');
        return;
      }
      res.render('signup', {
        countries: Backend.Config.countries,
        nStep: 2,
        message: req.session.message ? req.session.message.val : null,
        moment: moment,
        config: Backend.Config,
        userLanguage: req.session.lang,
        person: req.session.registration.person || '',
        locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
      });
    },
    /**
     * Tells the user to pick cruise preferences
     */
    3: (req, res) => {
      Backend.Dao.preference.findAll().then(preferences => {
        res.render('signup', {
          preferences,
          nStep: 3,
          message: req.session.message ? req.session.message.value : null,
          config: Backend.Config,
          userLanguage: req.session.lang,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
        });
      });
    },
    /**
     * Tells the user to pick a cabin
     */
    4: (req, res) => {
      if (!req.session.registration.studOrg) {
        req.session.registration.step = 1;
        res.redirect('/ilmo');
        return;
      }

      Backend.Dao.cabins.findAll({
        where: { studorgId: req.session.registration.studOrg },
        include: Backend.Dao.person
      }).then(queryResult => {
        let cabinStudorgs = queryResult.map(val => val.dataValues);
        // Add the reservations to the list
        for (let key in cabinReservationSystem.bucket) {
          let reservation = cabinReservationSystem.bucket[key];
          if (reservation && reservation.person.studOrg == req.session.registration.studOrg) {
            for (let i = 0; i < cabinStudorgs.length; i++) {
              let cabin = cabinStudorgs[i];
              if (cabin.id == reservation.cabinId) {
                let cabinPersons = cabin.persons.map(val => val.dataValues);
                reservation.person.notCompleted = true;
                cabinPersons.push(reservation.person);
                cabinStudorgs[i].persons = cabinPersons;
              }
            }
          }
        }
        res.render('signup', {
          cabinStudorgs,
          nStep: 4,
          chosenCabin: req.session.registration.cabin || null,
          reservations: cabinReservationSystem.getReservationCountForCabin,
          message: req.session.message ? req.session.message.value : null,
          studOrg: req.session.registration.studOrg,
          config: Backend.Config,
          userLanguage: req.session.lang,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
        });
      });
    },
    /**
     * Gives the use a summary of the registration
     */
    5: (req, res) => {
      Backend.Dao.studorg.findOne({
        where: { id: req.session.registration.studOrg }
      }).then(studorg => {
        res.render('signup', {
          studorg,
          registration: req.session.registration,
          nStep: 5,
          message: req.session.message ? req.session.message.value : null,
          config: Backend.Config,
          userLanguage: req.session.lang,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
        });
      });
    },
    6: (req, res) => {
      res.render('signup', {
        nStep: 6,
        message: req.session.message ? req.session.message.value : null,
        config: Backend.Config,
        userLanguage: req.session.lang,
        locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
      });
    }
  },
  /**
   * Defines a map of functions that handles post request to /ilmo.
   * The key for each function is the step number.
   */
  post: {
    /**
     * Handles the student organization selection.
     */
    1: (req, res) => {
      // No registration object? lets initialize it.
      if (!req.session.registration)
        req.session.registration = {};
      if (!req.session.registration.studorg) {
        // Do a check that the student organizations sign-up is open. Studorgs where the sign-up is still closed is
        // never listed in the front end, but there's always someone who tries to just POST straight to the backend.
        Backend.Dao.studorg.findOne({ where: { id: req.body.studorg } }).then(studorg => {
          if (studorg.dataValues.ilmo_start.getTime() > new Date().getTime()) {
            // lol wait a bit longer :^)
            req.session.registration.step = 1;
            res.redirect('/ilmo');
            return;
          } else {
            // Everything is OK, proceed to the next step.
            req.session.registration.studOrg = req.body.studorg;
            req.session.registration.step = 2;
            res.redirect('/ilmo/' + 2);
          }
        });
      } else res.redirect('/ilmo');
    },
    /**
     * Handles personal information
     */
    2: (req, res) => {
      // Fetch the cruise.
      Backend.Dao.cruise.findAll().then(cruise => {
        // Check that everything was filled in.
        if (!req.body.firstname || !req.body.lastname || !req.body.nationality || !req.body.email) {
          respond(req, res, 400, 'Missing information from form', '/ilmo');
          return;
        }

        // If this property doesn't exsist, we can assume that 
        // some noscript user is using the non-js for for signing up.
        if (!req.body.dob) {
          if (req.body.day && req.body.month && req.body.year) {
            req.body.dob = `${req.body.day}/${req.body.month}/${req.body.year}`;
          } else {
            respond(req, res, 400, 'No date entered', '/ilmo');
          }
        }

        if (req.body.firstname.length === 0 || req.body.lastname.length === 0) {
          respond(req, res, 400, 'Misformed firstname or lastname', '/ilmo');
          return;
        }

        if (req.body.firstname.length > 50 || req.body.lastname.length > 50) {
          respond(req, res, 400, 'Misformed firstname or lastname', '/ilmo');
          return;
        }

        // Validate date of birth
        if (!/[0-9][0-9]?\/[0-9][0-9]?\/[0-9]{4}$/.test(req.body.dob)) {
          respond(req, res, 400, 'Misformed date of birth', '/ilmo');
          return;
        }

        // Check that the age of the participant is high enough.
        let dobObj = moment(req.body.dob, 'DD-MM-YYYY');
        if (-moment.duration(dobObj.diff(moment(cruise[0].get('departure1')))).asYears() < Backend.Config.agelimit) {
          respond(req, res, 403, 'You are not allowed to attend this cruise with your current age', '/ilmo');
          return;
        }

        req.body.dob = dobObj;
        req.body.studOrg = req.session.registration.studOrg;

        // Check that the email format is fine.
        if (!/.+@.+/.test(req.body.email)) {
          res.redirect('/ilmo');
          return;
        }
        
        let personReservationUUID = (req.session.registration.person && req.session.registration.person.reservationUUID) ? req.session.registration.person.reservationUUID : null;
        req.session.registration.person = req.body;
        if (personReservationUUID == null) {
          req.session.registration.person.reservationUUID = '' + ((new Date().getTime()) + (Math.floor(Math.random() * 1000)));
        }
        else {
          req.body.reservationId = personReservationUUID;
          cabinReservationSystem.updateBucketValue(personReservationUUID, req.body);
          req.session.registration.person.reservationUUID = personReservationUUID; 
        }

        // Everything is gucchi.
        req.session.registration.step = 3;
        res.redirect('/ilmo/' + 3);
      });
    },
    /**
     * Handles preference selection
     */
    3: (req, res) => {
      // No prefereces picked, redirect
      if (!req.body.preference) {
        respond(req, res, 400, 'No preference chosen', '/ilmo');
        return;
      }
      if (!req.session.registration) {
        res.redirect('/ilmo');
        return;
      }
      if (!req.body) {
        res.redirect('/ilmo');
        return;
      }
      // Everything is fine, go to the next step.
      req.session.registration.preferences = req.body;
      req.session.registration.step = 4;
      res.redirect('/ilmo/' + 4);
    },
    /**
     * Handles the cabin selection
     */
    4: (req, res) => {
      req.session.registration.cabin = req.body.cabnum;
      if (!req.body.cabnum) {
        // No entry was found so just redirect back.
        res.redirect('/ilmo');
        return;
      }

      // Check that the cabin isn't full.
      Backend.Dao.person.findAll({
        where: { cabinId: req.session.registration.cabin },
        attributes: [[Backend.Dao.sequelize.fn('COUNT', Backend.Dao.sequelize.col('id')), 'c']]
      }).then(qres => {
        if (!qres[0].dataValues.c === undefined || (Number(qres[0].dataValues.c) + cabinReservationSystem.getReservationCountForCabin(req.session.registration.cabin)) >= 4) {
          // The cabin is full, redirect back.
          req.session.registration.step = 4;
          respond(req, res, 403, 'Cabin is full!', '/ilmo');
          return;
        }

        // If the user already has a cabin reserved, we should just switch
        if (cabinReservationSystem.bucket[req.session.registration.person.reservationUUID])
          cabinReservationSystem.changeCabinForUser(req.session.registration.cabin, req.session.registration.person.reservationUUID);
        else cabinReservationSystem.registerPersonToCabin(req.session.registration.person, req.session.registration.cabin);
        // Everything is ok, so let's go to the next step
        if (req.session.registration.step)
          req.session.registration.step = 5;
        res.redirect('/ilmo/' + 5);
      });
    },
    /**
     * This part inserts all the information into the database.
     */
    5: (req, res) => {
      let reg = req.session.registration;
      if (!cabinReservationSystem.bucket[reg.person.reservationUUID]) {
        // No reservation exsists, so redirect.
        req.session.registration.step = 4;
        respond(req, res, 403, 'Cabin reservation has expired', '/ilmo/4');
        return;
      }
      Backend.Dao.person.count({
        where: {
          cabinId: reg.cabin
        }
      }).then(count => {
        if ((count + cabinReservationSystem.getReservationCountForCabin(req.cabin)) >= 4) {
          respond(req, res, 403, 'Cabin is full!', '/ilmo/4');
          return;
        }
        
        const person = {
          firstname: reg.person.firstname,
          lastname: reg.person.lastname,
          dob: reg.person.dob,
          email: reg.person.email,
          studorgId: reg.studOrg,
          preferenceId: JSON.parse(reg.preferences.preference).id,
          cabinId: reg.cabin,
          reservationUUID: reg.person.reservationUUID,
          guardian: reg.person.guardian || 0,
          nationality: reg.person.nationality
        };
        Backend.Dao.person.create(person).then(person => {
          // Log this event
          Backend.Logger.rollbackQueryLog(`New person "${person.firstname} ${person.lastname}" registered.`, {
            action: 'insert',
            tableName: 'persons',
            reference: 'id',
            value: person.id
          });
          // Tells the other persons chosing cabins that the person is done. 
          cabinReservationSystem.completeRegistration(reg.person);
          // Sends an email to the person with a bunch of nice information about the cruise.
          createInfomail(person.email, person, req.session.lang === undefined ? 'fi' : req.session.lang);
        });
        req.session.registration.step = 6;
        res.redirect('/ilmo/' + 6);
      }).catch(e => {
        console.log(e);
        res.redirect('/ilmo');
      });
    },
    /**
     * Shows that the registration was successful.
     */
    6: (req, res) => {
      req.session.registration = null;
      if (req.body.fp !== undefined)
        res.redirect('/');
      else if (req.body.new !== undefined)
        res.redirect('/ilmo');
    }
  }
};