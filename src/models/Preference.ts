import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany, AllowNull, Length } from 'sequelize-typescript';
import PersonPreferences from './PersonPreference';
import Person from './Person';

@Table({ timestamps: true })
export default class Preference extends Model<Preference> {

  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  name: string;

  @AllowNull(false)
  @Length({ min: 1 })
  @Column
  description: string;

  @AllowNull(false)
  @Column
  price: number;

  @BelongsToMany(() => Person, () => PersonPreferences)
  persons: Person[];
}