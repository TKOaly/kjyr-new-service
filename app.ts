import 'reflect-metadata';
import { createExecutor, ExpressDriver } from 'routing-controllers';
import { MySQLSessionStore } from 'express-mysql-session';
import * as express from 'express';
import Database from './src/Database';

require('dotenv').config();

const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');

import IndexController from './src/controllers/IndexController';
import LoginController from './src/controllers/LoginController';
import AdminController from './src/controllers/AdminController';

let databse = new Database({
  host: process.env.KJYR_DB_HOST,
  username: process.env.KJYR_DB_USER,
  password: process.env.KJYR_DB_PASSWORD,
  database: process.env.KJYR_DB_NAME,
  dialect: 'mysql'
});

global.Backend = {
  Config: require('./src/config/config.js'),
  Localization: require('./src/config/localization.js'),
  Logger: null,
  Models: databse.sequelize.models
};

const expressDriver = new ExpressDriver();
const app = expressDriver.app;

app.use(express.static('./public'));
app.set('views', './public/views');
app.set('view engine', 'pug');
app.set('trust proxy', 1); // Should probably just be enabled for debugging.

app.use(helmet());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: process.env.KJYR_COOKIE_SECRET,
  cookie: {
    secure: false,
    maxAge: 120 * 60000
  }
}));
app.locals.moment = require('moment');

// Register contollers
createExecutor(expressDriver, {
  controllers: [
    IndexController,
    LoginController,
    AdminController
  ]
});

app.listen(3000);
