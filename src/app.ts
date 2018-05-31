require("dotenv").config();

import "reflect-metadata";
import { createExecutor, ExpressDriver, Action } from "routing-controllers";
// import { MySQLSessionStore } from "express-mysql-session";
import * as express from "express";
import Database from "./Database";
import * as session from "express-session";
import * as helmet from "helmet";

// Controllers
import IndexController from "./controllers/IndexController";
import LoginController from "./controllers/LoginController";
import AdminController from "./controllers/AdminController";
import RegistrationController from "./controllers/RegistrationController";
import StudentOrganizationController from "./controllers/API/StudentOrganizationController";
import SessionMessageHandler from "./utils/SessionMessageHandler";
import PreferenceController from "./controllers/API/PreferenceController";

let databse = new Database({
  host: process.env.KJYR_DB_HOST,
  username: process.env.KJYR_DB_USER,
  password: process.env.KJYR_DB_PASSWORD,
  database: process.env.KJYR_DB_NAME,
  port: Number(process.env.KJYR_DB_PORT),
  dialect: "mysql"
});

global.Backend = {
  Config: require("./src/config/config.js"),
  Localization: require("./src/config/localization.js"),
  Logger: null,
  Models: databse.sequelize.models
};

const expressDriver = new ExpressDriver();
expressDriver.useClassTransformer = false;
const app = expressDriver.app;

app.use(express.static("./public"));
app.set("views", "./public/views");
app.set("view engine", "pug");
app.set("trust proxy", 1); // Should probably just be enabled for debugging.

app.use(helmet());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    saveUninitialized: true,
    resave: true,
    secret: process.env.KJYR_COOKIE_SECRET,
    cookie: {
      secure: false,
      maxAge: 120 * 60000
    }
  })
);
app.use(new SessionMessageHandler().use);
app.locals.moment = require("moment");

// Register contollers
createExecutor(expressDriver, {
  controllers: [
    IndexController,
    LoginController,
    AdminController,
    RegistrationController,
    StudentOrganizationController,
    PreferenceController
  ],
  classTransformer: false, // enable when es6 compatible
  authorizationChecker: async (action: Action, roles: string[]) => {
    if (!action.request.session) {
      return false;
    }

    if (!action.request.session.auth) {
      return false;
    }

    if (roles.length === 0) {
      if (action.request.session.auth.role === "studorg") {
        return true;
      }
    } else if (roles[0] === "admin") {
      if (action.request.session.auth.role === "admin") return true;
    }
    return false;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listeting at %d", process.env.PORT || 3000);
});
