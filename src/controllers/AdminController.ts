import {
  Controller,
  Get,
  RedirectOrRender,
  Res,
  Session,
} from "routing-controllers";
import Cabin from "../models/Cabin";
import Cruise from "../models/Cruise";
import Person from "../models/Person";
import Preference from "../models/Preference";
import StudentOrganization from "../models/StudentOrganization";
import { KJYRSession } from "../utils/KJYRSession";

import * as express from "express";

/**
 * Controlls actions in the admin view.
 */

@Controller("/admin")
export default class AdminController {
  @Get("/")
  @RedirectOrRender("admin")
  public async getAdminView(
    @Session() session: KJYRSession,
    @Res() response: express.Response,
  ) {
    if (!session.auth || !session.auth.role) {
      return "/login";
    } else {
      if (session.auth.role === "admin") {
        // Fetch basically all data of the cruise.
        const cabins = await Cabin.findAll({ include: [Person] });
        const preferences = await Preference.findAll();
        const cruise = (await Cruise.findOne()) || {};
        const studOrgs = await StudentOrganization.findAll();
        return {
          cabins,
          preferences,
          cruise,
          jsEnabled: true,
          studOrgs,
          config: global.Backend.Config,
          adminMessage: "",
          userLanguage: session.lang,
          isAdmin: session.auth.role === "admin",
          locale: global.Backend.Localization[session.lang || "fi"],
        };
      }
    }
  }
}
