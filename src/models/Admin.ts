import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import StudentOrganization from "./StudentOrganization";

@Table({ timestamps: true })
export default class Admin extends Model<Admin> {
  @Column public username: string;

  @Column public passwordSalt: string;

  @Column public isAdmin: boolean;

  @ForeignKey(() => StudentOrganization)
  @Column
  public studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  public studentOrganization: StudentOrganization;
}
