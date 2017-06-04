const localization = require('../../config/localization.json');

module.exports = new StartpageHanlder();

function StartpageHanlder() {
  this.handleGetRequest = (req, res) => {
    // This browser or whatever has some language settings, so let's use that.
    if (req.headers['accept-language'] && (!req.session || !req.session.lang)) {
      let lang = req.headers['accept-language'].split('-')[0];
      if (localization[lang]) {
        req.session.lang = lang;
      }
    }
    Backend.Dao.person.count().then(participants => {
      Backend.Dao.studorg.findAll().then(studOrgs => {
        let stats = {
          studorgs: studOrgs.length,
          participants
        }
        res.render('index', {
          stats,
          config: Backend.Config,
          userLanguage: req.session.lang,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang],
          studOrgs: studOrgs.map(elem => elem.dataValues)
        });
      });
    });
  };

  this.handlePostRequest = (req, res) => {
    req.session.lang = req.body.languageSelect;
    req.sessionStore.set(req.sessionID, req.session);
    req.session.save();
    res.redirect(req.headers.referer);
  }
};