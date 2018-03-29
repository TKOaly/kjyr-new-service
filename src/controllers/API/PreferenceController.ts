import { JsonController, Authorized, Redirect, Post, Body, Session } from "routing-controllers";
import Preference from "../../models/Preference";
import { flashMessage, KJYRSession } from "../../utils/KJYRSession";


@JsonController('/api/preferences')
export default class PreferenceController {

  @Post()
  @Authorized('admin')
  @Redirect('/admin')
  async createPreference( @Session() session: KJYRSession, @Body() preference: any ) {
    let newPreference = new Preference(preference);
    try {
      await newPreference.save();
    } catch(error) {
      let errorString: string;
      if (error.errors)
        errorString = error.errors.map(err => (err.message + '</br>'));
      else errorString = error.message;
      flashMessage(session, 'danger', errorString);
    }
  }
}