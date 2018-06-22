import {
  AllowNull,
  BelongsToMany,
  Column,
  Length,
  Model,
  Table,
} from "sequelize-typescript";
import Person from "./Person";
import PersonPreferences from "./PersonPreference";

@Table({ timestamps: true })
export default class Preference extends Model<Preference> {
  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  public name: string;

  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  public description: string;

  @AllowNull(false)
  @Column
  public price: number;

  @BelongsToMany(() => Person, () => PersonPreferences)
  public persons: Person[];
}
