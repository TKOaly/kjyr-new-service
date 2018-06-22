import * as express from "express";
import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Req,
  Session,
} from "routing-controllers";
import Person from "../models/Person";
import StudentOrganization from "../models/StudentOrganization";

/**
 * Controller for handling the landing page.
 */

@Controller()
export default class IndexController {
  @Get("/")
  @Render("index")
  public async getIndex(@Session() session: any) {
    // Fetch student organizations for the table for registration times
    // and participant count for stats.
    const studorgs = await StudentOrganization.findAll();
    const participants = await Person.count();
    const stats = {
      studorgs: studorgs.length,
      participants,
    };
    return {
      studOrgs: studorgs,
      stats,
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || "fi"],
    };
  }

  @Post("/")
  @Redirect("/")
  public postIndex(@Body() body: any, @Req() request: express.Request) {
    request.session.lang = body.languageSelect;
    return request.headers.referer;
  }
}
