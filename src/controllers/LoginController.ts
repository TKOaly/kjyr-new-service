import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Session,
} from "routing-controllers";
import Admin from "../models/Admin";
import StudentOrganizations from "../models/StudentOrganization";

import { flashMessage, KJYRAuth, KJYRSession } from "../utils/KJYRSession";

import * as bcrypt from "bcrypt";
/**
 * Controller for handling login actions to the admin control panel
 */

@Controller("/login")
export default class LoginController {
  @Get("/")
  @Render("login")
  public getAdminView(@Session() session: KJYRSession) {
    if (session.auth && session.auth.role) {
      return "/admin";
    }
    return {
      config: global.Backend.Config,
      userLanguage: session.lang,
      locale: global.Backend.Localization[session.lang || "fi"],
      message: session.message,
    };
  }

  @Post("/")
  @Redirect("/admin")
  public async login(@Session() session: KJYRSession, @Body() body: any) {
    const username = body.username;
    const password = body.passwd;
    const adminUser = await Admin.find({
      where: { username },
      include: [StudentOrganizations],
    });
    // Check the password hashes.
    if (adminUser && bcrypt.compareSync(password, adminUser.passwordSalt)) {
      session.auth = new KJYRAuth(
        adminUser.isAdmin ? "admin" : "studorg",
        adminUser.studentOrganization,
      );
      flashMessage(session, "success", "Logged in as " + adminUser.username);
    } else {
      flashMessage(session, "danger", "Wrong username or password");
    }
  }
}
