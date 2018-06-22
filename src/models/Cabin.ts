import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import Person from "./Person";
import StudentOrganization from "./StudentOrganization";

@Table({ timestamps: true })
export default class Cabin extends Model<Cabin> {
  @Column public price: number;

  @ForeignKey(() => StudentOrganization)
  @Column
  public studOrgId: number;

  @BelongsTo(() => StudentOrganization)
  public studentOrganization: StudentOrganization;

  @HasMany(() => Person)
  public persons: Person[];
}
