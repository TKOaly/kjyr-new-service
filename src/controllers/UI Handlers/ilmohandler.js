const localization = require('../../config/localization.json');
const stepHelpers = require('../../helpers/stephelpers')

module.exports = new IlmoHandler();

function IlmoHandler() {
  this.handleGetRequest = (req, res) => {
    if (req.params.step) {
      if (req.session.message && req.session.message.shown) {
        req.session.message = null;
      }

      if (req.session.message && !req.session.message.shown) {
        req.session.message.shown = true;
      }
    }
    if (Date.now() > Backend.Config.ilmo_end) {
      res.redirect('/');
      return;
    }
    let step = !req.session.registration ? 1 : req.session.registration.step;
    if (req.params.step) {
      if (req.params.step <= step) {
        step = req.params.step;
      } else {
        res.redirect('/ilmo/' + step);
        return;
      }
    } else {
      res.redirect('/ilmo/' + step);
      return;
    }
    stepHelpers.get[step](req, res);
  };

  this.handlePostRequest = (req, res) => {
    if (!req.session.registration)
      stepHelpers.post[1](req, res);
    else {
      let step = req.session.registration.step;
      if (req.params.step) {
        if (req.params.step <= step) {
          step = req.params.step;
        }
      }
      stepHelpers.post[step](req, res);
    }
  };
};
