import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany, IsEmail, IsBefore, Is } from 'sequelize-typescript';
import StudentOrganization from './StudentOrganization';
import Cabin from './Cabin';
import Preference from './Preference';
import PersonPreferences from './PersonPreference';

import * as moment from 'moment';
import { NotNull } from 'sequelize-typescript/lib/annotations/validation/NotNull';
import LocalizedInputError from '../utils/LocalizedInputError';


@Table({ timestamps: true })
export default class Person extends Model<Person> {

  @NotNull
  @Column
  firstName: string;

  @NotNull
  @Column
  lastName: string;

  @Is('eighten', value => {
    if (moment.duration(moment(new Date()).diff(moment(value, 'MM-DD-YYYY'))).asYears() > 18) {
      return true
    } else throw new LocalizedInputError('signup_error_user_is_kid');
  })
  @NotNull
  @Column
  birthDate: Date;

  @IsEmail
  @Column
  email: string;

  @ForeignKey(() => StudentOrganization)
  @NotNull
  @Column
  studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  studentOrganization: StudentOrganization;

  @ForeignKey(() => Cabin)
  @Column
  cabinId: number;

  @BelongsTo(() => Cabin)
  cabin: Cabin;

  @Column
  guardian: boolean;

  @Column
  nationality: string;

  @BelongsToMany(() => Preference, () => PersonPreferences)
  preferences: Preference[];

  @Column
  reservationUUID: string;

}