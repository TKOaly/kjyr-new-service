const localization = require('../../config/localization.js');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(13);

module.exports = new AdminHandler();

function AdminHandler() {
  this.handleGetRequest = (req, res) => {
    if (!req.session || !req.session.auth) {
      res.render('login', {
        config: Backend.Config,
        adminMessage: req.session.message || '',
        userLanguage: req.session.lang,
        locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
      });
    } else {
      // Log this event
      Backend.Logger.log(`${req.ip} logged in to admin account with ID ${req.session.auth.studOrg}.`);
      prepareAdminView(req.session.auth.studOrg, (cabins, studOrg, preferences, cruise) => {
        res.render('admin', {
          cabins,
          preferences,
          cruise,
          jsEnabled: req.session.auth.jsEnabled,
          studOrgs: studOrg,
          config: Backend.Config,
          adminMessage: req.session.message || '',
          userLanguage: req.session.lang,
          moment: require('moment'),
          isAdmin: req.session.auth.studOrg === 0,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
        });
      });
    }
  };

  this.handlePostRequest = (req, res) => {
    authorize(req.body.username, req.body.passwd, user => {
      if (req.session && user) {
        req.session.auth = user;
        req.session.auth.jsEnabled = req.query.jsEnabled != null ? true : false;
        req.session.message = 'Logged in as ' + user.name;
      }

      if (!user)
        req.session.message = 'Login failed. Check your credentials.';
      res.redirect('/admin');
    });
  }

  
/**
 * This function authrorizes and check for admin information
 * @param {String} username username of user
 * @param {String} password plain text password
 * @param {Function} cb callback with the admin as parameter
 */
  function authorize(username, password, cb) {
    if (!username || !password) {
      cb(null);
      return;
    }
    Backend.Dao.admin.findOne({ where: { username } }).then(res => {
      if (!res) {
        cb(null);
        return;
      }
      let admin = res.dataValues;
      bcrypt.compare(password, admin.passwordSalt, (err, res) => {
        if (err || !res) {
          cb(null);
          return;
        }
        if (res) {
          admin.role = admin.studorg_id === 0 ? 'admin' : 'studorg';
          delete admin.password;
          cb(admin);
        }
      });
    });
  }

  /**
   * This function fetches all required information for the admin view
   * @param {Number/String} studorgId 
   * @param {Function} cb called when the fetching is done (cabins, studorg, preferences, [cruise])
   */
  function prepareAdminView(studorgId, cb) {
    if (studorgId === 0) {
      prepareCruiseAdminView(cb);
      return;
    }
    Backend.Dao.studorg.findOne({
      where: {
        id: studorgId,
      },
      include: [Backend.Dao.cabins, Backend.Dao.person]
    }).then(res => {
      let cabins = {};
      res.cabins.forEach(cabin => {
        cabin.persons = [];
        cabins[cabin.id] = cabin;
      });
      res.dataValues.persons.forEach(person => {
        person = person.dataValues;
        if (cabins[person.cabinId])
          cabins[person.cabinId].persons.push(person);
      });
      Backend.Dao.preference.findAll().then(prefs => {
        cb(cabins, [res.dataValues], prefs.map(p => p.dataValues));
      });
    }).catch(e => {
      console.log(e);
      cb(null, null);
    });
  }

  /**
   * Same as prepareAdminView but fetches more stuff
   * @param {*} cb 
   */
  function prepareCruiseAdminView(cb) {
    Backend.Dao.studorg.findAll({
      include: [Backend.Dao.cabins, Backend.Dao.person]
    }).then(res => {
      let cabins = {};
      res.forEach(studorg => {
        studorg.cabins.forEach(cabin => {
          cabin.persons = [];
          cabins[cabin.id] = cabin;
        });
        studorg.dataValues.persons.forEach(person => {
          person = person.dataValues;
          if (cabins[person.cabinId])
            cabins[person.cabinId].persons.push(person);
        });
      });
      Backend.Dao.preference.findAll().then(prefs => {
        Backend.Dao.cruise.findOne().then(cruise => {
          // Kind of a shitty solution. The whole cruise thing should be fixed.
          if (cruise === null) cruise = '';
          cb(cabins, res.map(res => res.dataValues), prefs.map(p => p.dataValues), cruise);
        });
      });
    }).catch(e => {
      console.log(e);
      cb(null, null);
    });
  }
};
