import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import StudentOrganization from './StudentOrganization';
import Cabin from './Cabin';
import Preference from './Preference';
import PersonPreferences from './PersonPreference';

@Table({ timestamps: true })
export default class Person extends Model<Person> {

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  birthDate: Date;

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

}