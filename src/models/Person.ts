import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany, IsEmail, IsBefore, Is, AllowNull } from 'sequelize-typescript';
import StudentOrganization from './StudentOrganization';
import Cabin from './Cabin';
import Preference from './Preference';
import PersonPreferences from './PersonPreference';

import * as moment from 'moment';
import LocalizedInputError from '../utils/LocalizedInputError';


@Table({ timestamps: true })
export default class Person extends Model<Person> {

  @AllowNull(false)
  @Column
  firstName: string;

  @AllowNull(false)
  @Column
  lastName: string;

  @Is('eighten', value => {
    if (moment.duration(moment(new Date()).diff(moment(value, 'MM-DD-YYYY'))).asYears() > 18) {
      return true
    } else throw new Error('You are not allowed to attend the cruise with your current age.');
  })

  @AllowNull(false)
  @Column
  birthDate: Date;

  @AllowNull(false)
  @IsEmail
  @Column
  email: string;

  @ForeignKey(() => StudentOrganization)
  @AllowNull(false)
  @Column
  studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  studentOrganization: StudentOrganization;

  @ForeignKey(() => Cabin)
  @AllowNull(false)
  @Column
  cabinId: number;

  @BelongsTo(() => Cabin)
  cabin: Cabin;

  @Column
  guardian: boolean;

  @AllowNull(false)
  @Column
  nationality: string;

  @BelongsToMany(() => Preference, () => PersonPreferences)
  preferences: Preference[];

  @AllowNull(true)
  @Column
  reservationUUID: string;

  /**
   * Returns a Person object which is safe to be transported to public
   * use, in this case be emmitted via websocket to the frontend
   */
  getSafeForPublic(): Person {
    return new Person({
      firstName: this.firstName,
      lastName: this.lastName,
      reservationUUID: this.reservationUUID
    });
  }
}