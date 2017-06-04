const express = require('express');
const route = express.Router();
const cabins = require('./cabins');
const respond = require('../../utils/response').restResponse;

route.get('/', (req, res) => {
  // Dope hack for getting query params since express doesn't do that with routes.
  let studOrgId = req.baseUrl.match(/\d{1,3}/g)[0];
  Backend.Dao.cabins.findAll({
    where: { studOrgId }
  }).then(cabins => {
    if (cabins.length === 0) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, cabins);
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null);
  });
});

route.get('/:id', (req, res) => {
  let studOrgId = req.baseUrl.match(/\d{1,3}/g)[0];
  Backend.Dao.cabins.findOne({
    where: {
      studOrgId: req.params.id
    }
  }).then(cabin => {
    if (!cabin) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, cabin);
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null);
  });
});

route.post('/', (req, res) => {
  let studOrgId = req.baseUrl.match(/\d{1,3}/g)[0];
  if (!req.session.registration) {
    respond(res, req, 401, null, req.query.redir || '/admin');
    return;
  }

  if (req.session.registration.step != 4) {
    respond(res, req, 403, null, req.query.redir || '/admin');
    return;
  }
  Backend.Dao.studorg.findOne({
    where:{
      id: studOrgId
    },
    include: Backend.Dao.cabins
  }).then(studorg => {
    if (!studorg) {
      respond(res, req, 404, null, req.query.redir || '/admin');
      return;
    }
    studorg = studorg.dataValues;
    if ((studorg.cabins.length + 1) > studorg.cabin_quota) {
      respond(res, req, 403, null, req.query.redir || '/admin');
      return;
    }

    const Cabin = {
      studorgId: studorg.id,
      price: studorg.cabin_price
    };
    Backend.Dao.cabins.create(Cabin).then(cabin => {
      Backend.Logger.rollbackQueryLog(`New cabin for studorg ${studorg.name} created from ${req.ip}`, {
        action: 'insert',
        tableName: 'cabins',
        reference: 'id',
        value: cabin.id
      });
      respond(res, req, 200, cabin, req.query.redir || '/admin');
    }).catch(e => {
      console.log(e);
      respond(res, req, 500, null, req.query.redir || '/admin');
    });
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, req.query.redir || '/admin');
  });
});

module.exports = route;