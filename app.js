const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MySQLSessionStore = require('express-mysql-session');
const DB = require('./src/database');
const Logger = require('./src/utils/logger');
const app = express();
const helmet = require('helmet');

require('dotenv').config();

global.Backend = {};
Backend.Logger = new Logger();
Backend.Config = require('./src/config/config.js');
Backend.Database = new DB();
Backend.Dao = require('./src/models/model');

// Routes
const userInterfaceController = require('./src/controllers/ui');
const apiController = require('./src/controllers/rest/api');

app.use(helmet());
app.set('views', './public/views');
app.set('view engine', 'pug');
app.set('trust proxy', 1); // Should probably just be enabled for debugging.

// Set folder that contains static content.
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
const options = {
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      lang: 'lang'
    }
  }
};

Backend.Database.init();
Backend.Database.getConnection().connect();
const sessionStore = new MySQLSessionStore(options, Backend.Database.getConnection());
app.use(session({
  resave: true,
  store: sessionStore,
  saveUninitialized: true,
  resave: false,
  secret: process.env.KJYR_COOKIE_SECRET,
  cookie: {
    secure: false,
    maxAge: 120 * 60000
  }
}));

// Initialize routes.
app.use('/', userInterfaceController);
app.use('/api', apiController);

// Error handling
// Express js detects a error handling middleware if it has 4 arguments 👌 👌 👌 

const locale = require('./src/config/localization.json');
app.use((err, req, res, next) => {
  if (err) {
    Backend.Logger.log(err, 'error');
    res.status(500);
    res.render('error', {
      locale,
      config: Backend.Config
    });
  }
});

app.listen(process.env.NODE_ENV === 'production' ? process.env.KJYR_PROD_PORT : process.env.KJYR_DBG_PORT, () => {
  Backend.Logger.log('Server started!', 'info');
});

process.on('exit', e => {
  console.log(e);
  process.exit(1);
});

process.on('SIGINT', e => {
  console.log(e);
  process.exit(1);
});

process.on('uncaughtException', e => {
  console.log(e);
  process.exit(1);
});
