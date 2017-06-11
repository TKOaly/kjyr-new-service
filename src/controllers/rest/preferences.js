const route = require('express').Router();
const respond = require('../../utils/response').restResponse;

route.get('/', (req, res) => {
  Backend.Dao.preference.findAll().then(prefs => {
    if (prefs.length === 0) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, prefs, '/admin');
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, '/admin');
  });
});

route.get('/:id', (req, res) => {
  Backend.Dao.preference.findOne({
    where: { id: req.params.id }
  }).then(pref => {
    if (!pref) {
      respond(res, req, 404, null);
      return;
    }
    respond(res, req, 200, pref, '/admin');
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

  if (!req.body.name || !req.body.description || !req.body.price) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  const Preference = {
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price)
  };
  Backend.Dao.preference.create(Preference).then(pref => {
    Backend.Logger.rollbackQueryLog(`$Admin created a new preference from ${req.ip}.`, {
      action: 'insert',
      tableName: 'preferences',
      reference: 'id',
      value: pref.id
    });
    respond(res, req, 200, pref, '/admin');
  }).catch(e => {
    console.log(e);
    respond(res, req, 500, null, '/admin');
  });
});

const updatePref = (req, res) => {
  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;
  }

  if (req.session.auth.studOrg != 0) {
    respond(res, req, 403, null, '/admin');
    return;
  }

  if (!req.body.name || !req.body.description || !req.body.price) {
    respond(res, req, 400, null, '/admin');
    return;
  }

  const Preference = {
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price)
  };
  Backend.Dao.preference.findOne({
    where: {
      id: req.params.id
    }
  }).then(oldPreference => {
    if (!oldPreference) {
      respond(res, req, 404, null, '/admin');
      return;
    }

    for (let key in Preference) {
      if (Preference[key] == oldPreference[key]) {
        delete Preference[key];
      }
    }

    Backend.Dao.preference.update(Preference, {
      where: { id: req.params.id }
    }).then(pref => {
      Backend.Logger.rollbackQueryLog(`Admin updated preference from ${req.ip}. Values changed: ${Object.keys(Preference).join(', ')}`, {
        action: 'update',
        tableName: 'preferences',
        reference: 'id',
        value: oldPreference.id,
        newObject: Preference,
        oldObject: oldPreference
      });
      respond(res, req, 200, pref, '/admin');
    }).catch(e => {
      console.log(e);
      respond(res, req, 500, null, '/admin');
    });
  });
};


const deletePreference = (req, res) => {
  if (!req.session.auth) {
    respond(res, req, 401, null, '/admin');
    return;    
  }

  if (req.session.auth.studOrg != 0) {
    respond(res, req, 403, null, '/admin');
    return;
  }
  
  Backend.Dao.preference.findOne({
    where: {
      id: req.params.id
    }
  }).then(preference => {
    if (!preference) {
      respond(res, req, 404, null, '/admin');
      return;
    }
    Backend.Dao.preference.destroy({
      where: {
        id: preference.id
      }
    }).then(() => {
      Backend.Logger.rollbackQueryLog(`Admin deleted preference ${preference.name}`, {
        action: 'delete',
        tableName: 'studorgs',
        oldObject: preference.dataValues
      });
      respond(res, req, 200, null, '/admin');
    });
  }).catch(e => {
    Backend.Logger.log('Error while deleting preference');
    Backend.Logger.log(e);
    respond(res, req, 500, null, '/admin');
  });
}

route.post('/:id', updatePref);
route.patch('/:id', updatePref);
route.delete('/:id', deletePreference);
route.post('/:id/delete', deletePreference);
module.exports = route;