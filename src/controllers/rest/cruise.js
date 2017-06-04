const route = require('express').Router();
const respond = require('../../utils/response').restResponse;
const moment = require('moment');

route.get('/', (req, res) => {
  Backend.Dao.cruise.findOne().then(cruise => {
    if (prefs.length === 0) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, cruise, '/admin');
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, '/admin');
  });
});

const updateCruise = (req, res) => {
  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;
  }

  if (req.session.auth.studOrg != 0) {
    respond(res, req, 403, null, '/admin');
    return;
  }

  if (!req.body.ship || !req.body.departure1 || !req.body.arrival1 || !req.body.departure2 || !req.body.arrival2) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  let dep1 = moment(req.body.departure1, 'DD/MM/YYYY HH:mm').toDate(),
    dep2 = moment(req.body.departure2, 'DD/MM/YYYY HH:mm').toDate(),
    arr1 = moment(req.body.arrival1, 'DD/MM/YYYY HH:mm').toDate(),
    arr2 = moment(req.body.arrival2, 'DD/MM/YYYY HH:mm').toDate();

  Backend.Dao.cruise.findAll().then(cruises => {
    let count = cruises.length;
    const Cruise = {
      ship: req.body.ship,
      departure1: dep1,
      departure2: dep2,
      arrival1: arr1,
      arrival2: arr2
    };
    Backend.Dao.cruise[count > 0 ? "update" : "create"](Cruise, count > 0 ? {
      where: {
        id: 1
      }
    } : null).then(cruise => {
      let oldCruise = cruises[0];
      if (count > 0) {
        for (let key in Cruise) {
          if (Cruise[key] instanceof Date) {
            if (Cruise[key].getTime() === oldCruise[key].getTime()) {
              delete Cruise[key];
              continue;
            }
          }
          if (Cruise[key] == oldCruise[key]) {
            delete Cruise[key];
          }
        }
        Backend.Logger.rollbackQueryLog(`Admin updated cruise from ${req.ip}. values changed ${Object.keys(Cruise).join(', ')}`,
          {
            action: 'update',
            tableName: 'cruises',
            newObject: Cruise,
            oldObject: oldCruise,
            reference: 'id',
            value: oldCruise.id
          });
      }
      respond(res, req, 200, cruise, '/admin');
    });
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, '/admin');
  });
}

route.post('/', updateCruise);
route.patch('/', updateCruise);
module.exports = route;