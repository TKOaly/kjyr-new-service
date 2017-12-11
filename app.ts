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
global.Backend.Logger = new Logger();
global.Backend.Config = require('./src/config/config.js');
global.Backend.Database = new DB();
global.Backend.Dao = require('./src/models/model');

// Routes
const userInterfaceController = require('./src/controllers/ui');
const apiController = require('./src/controllers/rest/api');

app.use(helmet());
app.set('views', './public/views');
app.set('view engine', 'pug');
app.set('trust proxy', 1); // Should probably just be enabled for debugging.

// Set folder that contains static content.
app.use(express.static('./public'));
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

// global.Backend.Database.init();
//global.Backend.Database.getConnection().connect();

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: "sessionsecret",
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

const locale = require('./src/config/localization.js');
app.use((err, req, res, next) => {
  if (err) {
    global.Backend.Logger.log(err, 'error');
    res.status(500);
    res.render('error', {
      locale,
      config: global.Backend.Config
    });
  }
});

app.listen(5000, () => {
  global.Backend.Logger.log('Server started!', 'info');
});

process.on('exit', e => {
  console.log(e);
  process.exit(1);
});

process.on('SIGINT', () => {
  process.exit(1);
});

process.on('uncaughtException', e => {
  console.log(e);
  process.exit(1);
});
