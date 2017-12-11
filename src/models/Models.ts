import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';

@Table({ timestamps: true })
export class StudentOrganization extends Model<StudentOrganization> {

  @Column
  name: string;

  @Column
  quota: number;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  guardianQuota: number;

  @Column
  cabinQuota: number;

  @Column
  cabinPrice: number;

  @Column
  ilmoStart: Date;

  @HasOne(() => Admin)
  admin: Admin;

  @HasMany(() => Person)
  persons: Person[];

  @HasMany(() => Cabin)
  cabins: Cabin[];
}

@Table({ timestamps: true })
export class Admin extends Model<Admin> {

  @Column
  username: string;

  @Column
  passwordSalt: string;

  @Column
  isAdmin: boolean;

  @ForeignKey(() => StudentOrganization)
  @Column
  studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  studentOrganization: StudentOrganization;
}

@Table({ timestamps: true })
export class Person extends Model<Person> {

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

@Table({ timestamps: true })
export class Preference extends Model<Preference> {

  @Column
  name: string;

  @Column
  description: string;

  @Column
  price: number;

  @BelongsToMany(() => Person, () => PersonPreferences)
  preferences: Preference[];
}

/**
 * Junction table for person and preferences
 */
@Table({ timestamps: false })
export class PersonPreferences extends Model<PersonPreferences> {

  @ForeignKey(() => Person)
  @Column
  personId: number;

  @ForeignKey(() => Preference)
  @Column
  preferenceId: number;
}

@Table({ timestamps: true })
export class Cabin extends Model<Cabin> {

  @Column
  price: number;

  @ForeignKey(() => StudentOrganization)
  @Column
  studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  studentOrganization: StudentOrganization;
}

@Table({ timestamps: false })
export class Cruise extends Model<Cabin> {
  
  @Column
  ship: string;

  @Column
  departure1: Date;

  @Column
  arrival1: Date;

  @Column
  departure2: Date;

  @Column
  arrival2: Date;
}