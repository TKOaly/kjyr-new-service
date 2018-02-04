import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany, IsEmail, IsBefore } from 'sequelize-typescript';
import StudentOrganization from './StudentOrganization';
import Cabin from './Cabin';
import Preference from './Preference';
import PersonPreferences from './PersonPreference';

import * as moment from 'moment';

@Table({ timestamps: true })
export default class Person extends Model<Person> {

  @Column
  firstName: string;

  @Column
  lastName: string;

  @IsBefore(moment(new Date(Date.now() - (18 * 365 * 24 * 60 * 60 * 1000))).toISOString())
  @Column
  birthDate: Date;

  @IsEmail
  @Column
  email: string;

  @ForeignKey(() => StudentOrganization)
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

  validateAndApplyPostData(postData: any): void {
    
  }

}