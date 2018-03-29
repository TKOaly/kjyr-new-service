import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany, AllowNull, Length } from 'sequelize-typescript';
import Admin from './Admin';
import Person from './Person';
import Cabin from './Cabin';

import * as bcrypt from 'bcrypt';

@Table({ timestamps: true })
export default class StudentOrganization extends Model<StudentOrganization> {

  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  name: string;

  @AllowNull(false)
  @Column
  quota: number;

  @AllowNull(false)
  @Column
  email: string;

  @AllowNull(false)
  @Column
  phone: string;

  @AllowNull(false)
  @Column
  guardianQuota: number;

  @AllowNull(false)
  @Column
  cabinQuota: number;

  @AllowNull(false)
  @Column
  cabinPrice: number;

  @AllowNull(false)
  @Column
  ilmoStart: Date;

  @HasOne(() => Admin)
  admin: Admin;

  @HasMany(() => Person)
  persons: Person[];

  @HasMany(() => Cabin)
  cabins: Cabin[];

  createAdminUser(password: string): Admin {
    let admin = new Admin();
    admin.isAdmin = false;
    admin.studOrgId = this.id;
    admin.passwordSalt = bcrypt.hashSync(password, 10);
    admin.save();
    return admin;
  }
}