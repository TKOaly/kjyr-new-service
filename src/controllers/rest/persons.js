const express = require('express');
const route = express.Router();
const moment = require('moment');
const respond = require('../../utils/response').restResponse;

route.get('/', (req, res) => {
  let studOrg = req.baseUrl.match(/\d{1,3}/g)[0];
  Backend.Dao.person.findAll({
    where: {
      studOrgId: studOrg
    }
  }).then(list => {
    if (list.length === 0) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, list.map(p => ({ firstname: p.firstname, lastname: p.lastname, cabinId: p.cabinId })));
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null);
  });
});

route.get('/:id', (req, res) => {
  console.log(req.ip);
  let studOrg = req.baseUrl.match(/\d{1,3}/g)[0];
  Backend.Dao.person.findOne({
    where: {
      studOrgId: studOrg,
      id: req.params.id
    }
  }).then(p => {
    if (!p) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, { firstname: p.firstname, lastname: p.lastname, cabinId: p.cabinId });
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null);
  });
});

const updatePerson = (req, res) => {
  let studOrg = req.baseUrl.match(/\d{1,3}/g)[0];


  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;
  }

  if (!req.body.studorg && req.session.auth.studOrg == 0) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  Backend.Dao.cruise.findAll().then(cruise => {
    let studorgCabinsPromise = Backend.Dao.cabins.findAll({
      where: {
        studorgId: req.body.studorg
      }
    });
    let personPromise = Backend.Dao.person.findOne({
      where: {
        id: req.params.id
      }
    });
    let dob = `${req.body.year}-${req.body.month}-${req.body.day}`;
    if (req.body.dob && (!req.body.day || !req.body.month || !req.body.year)) {
      dob = req.body.dob;
    }
    if (!/[0-9]{4}-[0-9][0-9]?-[0-9][0-9]?$/.test(dob)) {
      respond(res, req, 400, null, '/admin');
      return;
    }
    if (!req.body.firstname || !req.body.lastname || !req.body.nationality || !req.body.email || !req.body.preference) {
      respond(res, req, 400, null, '/admin');
      return;
    }

    if (req.session.auth.studOrg != studOrg) {
      if (req.session.auth.studOrg != 0) {
        respond(res, req, 403, null, '/admin');
        return;
      }
    }

    if (-moment.duration(moment(dob, 'YYYY-MM-DD').diff(moment(cruise[0].get('departure1')))).asYears() < Backend.Config.agelimit) {
      respond(res, req, 403, null, '/admin');
      return;
    }

    if (!/.+@.+/.test(req.body.email)) {
      respond(res, req, 400, null, '/admin');
      return;
    }

    // We passed all the verifications, let's just update this thing.
    const person = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      dob: moment(dob, 'YYYY-MM-DD').toDate(),
      email: req.body.email,
      preferenceId: 1,
      cabinId: req.body.cabin,
      guardian: req.body.guardian || 0,
      nationality: req.body.nationality,
      preferenceId: req.body.preference
    };

    studorgCabinsPromise.then(studorgCabins => {
      if (req.session.auth.studOrg == 0) {
        person.studorgId = Number(req.body.studorg);
        if (studorgCabins.map(c => c.id).indexOf(Number(req.body.cabin)) === -1) {
          respond(res, req, 400, null, '/admin');
          return;
        }
      }

      personPromise.then(oldPerson => {
        if (!oldPerson) {
          respond(res, req, 404, null, '/admin');
          return;
        }
        // Update only stuff that actually has changed.
        for (let key in person) {
          if (person[key] instanceof Date) {
            if (person[key].getTime() === oldPerson[key].getTime()) {
              delete person[key];
              continue;
            }
          }
          if (person[key] == oldPerson[key]) {
            delete person[key];
          }
        }

        Backend.Dao.person.update(person, {
          where: {
            id: req.params.id
          }
        }).then(e => {
          // Log this event.
          Backend.Logger.rollbackQueryLog(`User ${oldPerson.firstname} ${oldPerson.lastname} ID: ${oldPerson.id} updated by studOrgAdmin ${req.session.auth.studOrg} from ${req.ip}. values changed ${Object.keys(person).join(', ')}`,
            {
              action: 'update',
              tableName: 'persons',
              newObject: person,
              oldObject: oldPerson,
              reference: 'id',
              value: oldPerson.id
            });
          respond(res, req, 200, null, '/admin');
        }).catch(e => {
          console.log(e);
          respond(res, req, 500, null, '/admin');
        });
      });
    });
  });
}

const deletePerson = (req, res) => {
  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;
  }
  Backend.Dao.person.findOne({
    where: {
      id: req.params.id
    }
  }).then(person => {
    if (!person) {
      respond(res, req, 404, null, '/admin');
      return;
    }
    

    if (person.studorgId != req.session.auth.studOrg && req.session.auth.studOrg != 0) {
      respond(res, req, 403, null, '/admin');
      return;
    }

    Backend.Dao.person.destroy({
      where: {
        id: person.id
      }
    }).then(() => {
      Backend.Logger.rollbackQueryLog(`Person ${person.firstname} ${person.lastname} deleted`, {
        action: 'delete',
        tableName: 'persons',
        oldObject: person.dataValues
      });
      respond(res, req, 200, null, '/admin');
    });
  }).catch(e => {
    Backend.Logger.log('Error while deleting person');
    Backend.Logger.log(e);
    respond(res, req, 500, null, '/admin');
  });
}

/**
 * Since the site uses no client side JS, we'll use a POST endpoint to update 
 * person information. I hope that one day the site will be completely rebuilt
 * so that all communication with the backend is done through this REST API, which
 * would also means that the PATCH endpoint could be used.
 */
route.post('/:id', updatePerson);
route.patch('/:id', updatePerson);
route.delete('/:id', deletePerson);
route.post('/:id/delete', deletePerson);


module.exports = route;