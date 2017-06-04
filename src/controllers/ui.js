const express = require('express');
const route = express.Router();

// Handlers
const startpageHandler = require('./UI Handlers/startpagehandler');
const ilmoHandler = require('./UI Handlers/ilmohandler');
const statHandler = require('./UI Handlers/stathandler');
const adminHandler = require('./UI Handlers/adminhandler');

route.get('/', (req, res) => startpageHandler.handleGetRequest(req, res));
route.post('/', (req, res) => startpageHandler.handlePostRequest(req, res));

route.get('/stats', (req, res) => statHandler.handleGetRequest(req, res));

route.get('/ilmo', (req, res) => ilmoHandler.handleGetRequest(req, res));
route.get('/ilmo/:step', (req, res) => ilmoHandler.handleGetRequest(req, res));

route.post('/ilmo', (req, res) => ilmoHandler.handlePostRequest(req, res));
route.post('/ilmo/:step', (req, res) => ilmoHandler.handlePostRequest(req, res));


route.get('/admin', (req, res) => adminHandler.handleGetRequest(req, res));
route.post('/admin', (req, res) => adminHandler.handlePostRequest(req, res));

route.all('/session', (req, res) => {
  if (req.session) {
    if (req.query.purge) {
      Backend.Logger.log(`${req.ip} logged out with admin account ${req.session.auth.studOrg}`);
      delete req.session.auth;
      res.redirect('/admin');
    } else if (req.query.back) {
      if (req.query.step)
        req.session.registration.step = Number(req.query.step);
      else { 
        req.session.registration.step--;
        res.redirect('/ilmo' + req.session.registration.step);
      }
      res.redirect('/ilmo');
    }
  }
});


module.exports = route;