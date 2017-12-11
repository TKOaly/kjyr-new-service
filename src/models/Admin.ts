import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import StudentOrganization from './StudentOrganization';


@Table({ timestamps: true })
export default class Admin extends Model<Admin> {

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