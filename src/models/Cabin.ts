import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import StudentOrganization from './StudentOrganization';
import Person from './Person';



@Table({ timestamps: true })
export default class Cabin extends Model<Cabin> {

  @Column
  price: number;

  @ForeignKey(() => StudentOrganization)
  @Column
  studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  studentOrganization: StudentOrganization;

  @HasMany(() => Person)
  persons: Person[];
}
