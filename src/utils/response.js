const locale = require('../config/localization.js');

const statusMessages = {
  200: 'Success',
  400: 'Bad request, missing paramteres or wrong parameters?',
  401: 'Unauthorized',
  404: 'Not found',
  403: 'Forbidden',
  500: 'Internal server error'
}

module.exports = {
  restResponse: (res, req, status, data, redir) => {
    if (req.query.vanilla) {
      res.status(status);
      req.session.message = status + ': ' + statusMessages[status];
      res.redirect(redir);
      return;
    }
    res.status(status).json({
      message: statusMessages[status],
      data
    });
  },
  stepResponse: (req, res, status, messageLocaleKey, redir) => {
    res.status(status);
    req.session.message = {};
    req.session.message.val = locale[req.session.lang][messageLocaleKey] + ` (${status})`;
    req.session.message.shown = false;
    res.redirect(redir);
  }
}