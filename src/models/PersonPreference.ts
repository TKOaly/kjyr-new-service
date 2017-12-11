import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import Preference from './Preference';
import Person from './Person';

/**
 * Junction table for person and preferences
 */
@Table({ timestamps: false })
export default class PersonPreferences extends Model<PersonPreferences> {

  @ForeignKey(() => Person)
  @Column
  personId: number;

  @ForeignKey(() => Preference)
  @Column
  preferenceId: number;
}