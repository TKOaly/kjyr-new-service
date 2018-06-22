import { Response } from "express";
import {
  Authorized,
  Body,
  JsonController,
  Param,
  Post,
  Redirect,
  Res,
  Session,
} from "routing-controllers";

import StudentOrganization from "../../models/StudentOrganization";
import {
  flashMessage,
  KJYRSession,
} from "../../utils/KJYRSession";

@JsonController("/api/studorgs")
export default class StudentOrganizationController {
  @Post("/")
  @Authorized("admin")
  @Redirect("/admin")
  public async addStudentOrganization(
    @Session() session: KJYRSession,
    @Body() studorg: any,
    @Res() response: Response,
  ) {
    const newStudorg = new StudentOrganization(studorg);
    newStudorg.quota = newStudorg.cabinQuota * 4;
    newStudorg.createAdminUser(studorg.admin_password);
    try {
      await newStudorg.save();
    } catch (e) {
      return "/admin";
    }
  }

  @Post("/:id/delete")
  @Authorized("admin")
  @Redirect("/admin")
  public deleteStudorg(@Param("id") id: number) {
    StudentOrganization.destroy({ where: { id } });
  }

  @Post("/:id")
  @Authorized("admin")
  @Redirect("/admin")
  public async updateStudorg(
    @Session() session: KJYRSession,
    @Body() studorg: any,
    @Param("id") id: number,
  ) {
    try {
      await StudentOrganization.update(studorg, { where: { id } });
      flashMessage(session, "success", "Student organization updated");
    } catch (error) {
      flashMessage(
        session,
        "danger",
        error.errors ? error.errors.map(err => err.message) : error.message,
      );
    }
  }
}
