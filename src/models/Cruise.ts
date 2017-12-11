import { Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';


@Table({ timestamps: false })
export default class Cruise extends Model<Cruise> {

  @Column
  ship: string;

  @Column
  departure1: Date;

  @Column
  arrival1: Date;

  @Column
  departure2: Date;

  @Column
  arrival2: Date;
}