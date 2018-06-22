import {
  Authorized,
  Body,
  JsonController,
  Post,
  Redirect,
  Session,
} from "routing-controllers";
import Preference from "../../models/Preference";
import { flashMessage, KJYRSession } from "../../utils/KJYRSession";

@JsonController("/api/preferences")
export default class PreferenceController {
  @Post()
  @Authorized("admin")
  @Redirect("/admin")
  public async createPreference(
    @Session() session: KJYRSession,
    @Body() preference: any,
  ) {
    const newPreference = new Preference(preference);
    try {
      await newPreference.save();
    } catch (error) {
      let errorString: string;
      if (error.errors) {
        errorString = error.errors.map(err => err.message + "</br>");
      } else {
        errorString = error.message;
      }

      flashMessage(session, "danger", errorString);
    }
  }
}
