import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  Is,
  IsEmail,
  Length,
  Model,
  Table,
} from "sequelize-typescript";
import Cabin from "./Cabin";
import PersonPreferences from "./PersonPreference";
import Preference from "./Preference";
import StudentOrganization from "./StudentOrganization";

import * as moment from "moment";

@Table({ timestamps: true })
export default class Person extends Model<Person> {
  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  public firstName: string;

  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  public lastName: string;

  @Is("eighten", value => {
    if (
      moment
        .duration(moment(new Date()).diff(moment(value, "MM-DD-YYYY")))
        .asYears() > 18
    ) {
      return true;
    } else {
      throw new Error(
        "You are not allowed to attend the cruise with your current age.",
      );
    }
  })
  @AllowNull(false)
  @Column
  public birthDate: Date;

  @AllowNull(false)
  @IsEmail
  @Column
  public email: string;

  @ForeignKey(() => StudentOrganization)
  @AllowNull(false)
  @Column
  public studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  public studentOrganization: StudentOrganization;

  @ForeignKey(() => Cabin)
  @AllowNull(false)
  @Column
  public cabinId: number;

  @BelongsTo(() => Cabin)
  public cabin: Cabin;

  @Column public guardian: boolean;

  @AllowNull(false)
  @Column
  public nationality: string;

  @BelongsToMany(() => Preference, () => PersonPreferences)
  public preferences: Preference[];

  @AllowNull(true)
  @Column
  public reservationUUID: string;

  /**
   * Returns a Person object which is safe to be transported to public
   * use, in this case be emmitted via websocket to the frontend
   */
  public getSafeForPublic(): Person {
    return new Person({
      firstName: this.firstName,
      lastName: this.lastName,
      reservationUUID: this.reservationUUID,
    });
  }
}
