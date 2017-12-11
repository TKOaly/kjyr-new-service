import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import Admin from './Admin';
import Person from './Person';
import Cabin from './Cabin';


@Table({ timestamps: true })
export default class StudentOrganization extends Model<StudentOrganization> {

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