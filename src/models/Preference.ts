import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import PersonPreferences from './PersonPreference';
import Person from './Person';

@Table({ timestamps: true })
export default class Preference extends Model<Preference> {

  @Column
  name: string;

  @Column
  description: string;

  @Column
  price: number;

  @BelongsToMany(() => Person, () => PersonPreferences)
  preferences: Preference[];
}