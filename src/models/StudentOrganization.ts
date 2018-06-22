import {
  AllowNull,
  Column,
  HasMany,
  HasOne,
  Length,
  Model,
  Table,
} from "sequelize-typescript";
import Admin from "./Admin";
import Cabin from "./Cabin";
import Person from "./Person";

import * as bcrypt from "bcrypt";

@Table({ timestamps: true })
export default class StudentOrganization extends Model<StudentOrganization> {
  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  public name: string;

  @AllowNull(false)
  @Column
  public quota: number;

  @AllowNull(false)
  @Column
  public email: string;

  @AllowNull(false)
  @Column
  public phone: string;

  @AllowNull(false)
  @Column
  public guardianQuota: number;

  @AllowNull(false)
  @Column
  public cabinQuota: number;

  @AllowNull(false)
  @Column
  public cabinPrice: number;

  @AllowNull(false)
  @Column
  public ilmoStart: Date;

  @HasOne(() => Admin)
  public admin: Admin;

  @HasMany(() => Person)
  public persons: Person[];

  @HasMany(() => Cabin)
  public cabins: Cabin[];

  public createAdminUser(password: string): Admin {
    const admin = new Admin();
    admin.isAdmin = false;
    admin.studOrgId = this.id;
    admin.passwordSalt = bcrypt.hashSync(password, 10);
    admin.save();
    return admin;
  }
}
