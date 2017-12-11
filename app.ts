import 'reflect-metadata';
import {createExpressServer} from "routing-controllers";
import * as session from 'express-session';
import  {MySQLSessionStore} from 'express-mysql-session';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';

import IndexController from './src/controllers/IndexController';

global.Backend = {
  Config: require('./src/config/config.js'),
  Localization: require('./src/config/localization.js'),
  Logger: null
};

const app : express.Express = createExpressServer({
  controllers: [IndexController]
});

app.set('views', './public/views');
app.set('view engine', 'pug');
app.set('trust proxy', 1); // Should probably just be enabled for debugging.

// Set folder that contains static content.
app.use(express.static('./public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.listen(3000);
