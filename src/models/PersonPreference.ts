import {
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Person from "./Person";
import Preference from "./Preference";

/**
 * Junction table for person and preferences
 */
@Table({ timestamps: false })
export default class PersonPreferences extends Model<PersonPreferences> {
  @ForeignKey(() => Person)
  @Column
  public personId: number;

  @ForeignKey(() => Preference)
  @Column
  public preferenceId: number;
}
