const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');
const moment = require('moment');
const respond = require('../../utils/response').restResponse;

route.get('/', (req, res) => {
  Backend.Dao.studorg.findAll().then(studorgs => {
    if (studorgs.length === 0) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, studorgs, '/admin');
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, '/admin');
  });
});

route.get('/:id', (req, res) => {
  Backend.Dao.studorg.findOne({ where: { id: req.params.id } }).then(org => {
    if (!org) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, org, '/admin');
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, '/admin');
  });
});

route.post('/', (req, res) => {

  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;
  }

  if (req.session.auth.studOrg != 0) {
    respond(res, req, 403, null, '/admin');
    return;
  }

  if (!req.body.name || !req.body.contact_email || !req.body.contact_telephone || !req.body.ilmo_start || !req.body.guardian_quota || !req.body.cabin_quota || !req.body.admin_password) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  if (!/[0-3][0-9]\/[0-9][0-9]?\/[0-9]{4} [0-2][0-9]:[0-5][0-9]$/.test(req.body.ilmo_start)) {
    respond(res, req, 400, null, '/admin');
    return;
  } else {
    req.body.ilmo_start = moment(req.body.ilmo_start, 'DD/MM/YYYY HH:mm');
  }

  if (!/.+@.+/.test(req.body.contact_email)) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  const studorg = {
    name: req.body.name,
    quota: req.body.cabin_quota,
    email: req.body.contact_email,
    phone: req.body.contact_telephone,
    cabin_quota: req.body.cabin_quota,
    guardian_quota: req.body.guardian_quota,
    cabin_price: Number(req.body.cabin_price) * 100,
    ilmo_start: req.body.ilmo_start
  };

  // Begin transaction
  Backend.Dao.sequelize.transaction(t => {
    return Backend.Dao.studorg.create(studorg, { transaction: t }).then(studorg => {
      let salt = bcrypt.hashSync(req.body.admin_password, 10);
      Backend.Logger.rollbackQueryLog(`Admin created a new student organization from ${req.ip}.`, {
        action: 'insert',
        tableName: 'studorgs',
        reference: 'id',
        value: studorg.id
      });

      const adminAccount = {
        username: req.body.name,
        passwordSalt: salt,
        studOrg: studorg.id
      };
      return Backend.Dao.admin.create(adminAccount, { transaction: t });
    });
  }).then(adminAccount => {
    Backend.Logger.rollbackQueryLog(`Created admin account for ${studorg.name}.`, {
      action: 'insert',
      tableName: 'admins',
      reference: 'id',
      value: adminAccount.id
    });
    respond(res, req, 200, null, '/admin');
  }).catch(e => {
    respond(res, req, 500, null, '/admin');
    console.log(e);
  });
});

const updateStudorg = (req, res) => {
  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;
  }

  if (req.session.auth.studOrg != req.params.id) {
    if (req.session.auth.studOrg != 0) {
      respond(res, req, 403, null, '/admin');
      return;
    }
  }

  if (!req.body.contact_email || !req.body.contact_telephone || !req.body.ilmo_start) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  if (!/[0-3][0-9]\/[0-9][0-9]?\/[0-9]{4} [0-2][0-9]:[0-5][0-9]$/.test(req.body.ilmo_start)) {
    respond(res, req, 400, null, '/admin');
    return;
  } else req.body.ilmo_start = moment(req.body.ilmo_start, 'DD/MM/YYYY HH:mm').toDate();


  if (!/.+@.+/.test(req.body.contact_email)) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  const studorg = {
    name: req.body.name,
    email: req.body.contact_email,
    phone: req.body.contact_telephone,
    ilmo_start: req.body.ilmo_start
  };

  if (req.session.auth.studOrg == 0) {
    if (req.body.cabin_quota)
      studorg.quota = req.body.cabin_quota;
    if (req.body.guardian_quota)
      studorg.guardian_quota = req.body.guardian_quota || 0 ;
  } else if (req.session.auth.studOrg == 0 && (req.body.cabin_quota || req.body.guardian_quota)) {
    respond(res, req, 403, null, '/admin');
    return;
  }

  Backend.Dao.studorg.findOne({
    where: {
      id: req.params.id
    }
  }).then(oldStudorg => {

    for (let key in studorg) {
      if (studorg[key] instanceof Date) {
        if (studorg[key].getTime() === oldStudorg[key].getTime()) {
          delete studorg[key];
          continue;
        }
      }
      if (studorg[key] == oldStudorg[key]) {
        delete studorg[key];
      }
    }

    Backend.Dao.studorg.update(studorg,
      {
        where: { id: req.params.id }
      }).then(newStudorg => {
        Backend.Logger.rollbackQueryLog(`Studorg admin with id ${req.session.auth.studOrg} updated studorg. Values changed: ${Object.keys(studorg).join(', ')}`, {
          action: 'update',
          tableName: 'studorgs',
          reference: 'id',
          value: oldStudorg.id,
          newObject: studorg,
          oldObject: oldStudorg
        });
        respond(res, req, 200, null, '/admin');
      }).catch(e => {
        respond(res, req, 500, null, '/admin');
        console.log(e);
      });
  });
};

const deleteStudorg = (req, res) => {
  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;    
  }

  if (req.session.auth.studOrg != 0) {
    respond(res, req, 403, null, '/admin');
    return;
  }
  
  Backend.Dao.studorg.findOne({
    where: {
      id: req.params.id
    }
  }).then(studorg => {
    if (!studorg) {
      respond(res, req, 404, null, '/admin');
      return;
    }
    Backend.Dao.studorg.destroy({
      where: {
        id: studorg.id
      }
    }).then(() => {
      Backend.Logger.rollbackQueryLog(`Admin deleted studorg ${studorg.name}`, {
        action: 'delete',
        tableName: 'studorgs',
        oldObject: studorg.dataValues
      });
      respond(res, req, 200, null, '/admin');
    });
  }).catch(e => {
    Backend.Logger.log('Error while deleting studorg');
    Backend.Logger.log(e);
    respond(res, req, 500, null, '/admin');
  });
}

route.post('/:id', updateStudorg);
route.patch('/:id', updateStudorg);
route.delete('/:id', deleteStudorg);
route.post('/:id/delete', deleteStudorg);

module.exports = route;