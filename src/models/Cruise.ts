import {
  Column,
  Model,
  Table,
} from "sequelize-typescript";

@Table({ timestamps: false })
export default class Cruise extends Model<Cruise> {
  @Column public ship: string;

  @Column public departure1: Date;

  @Column public arrival1: Date;

  @Column public departure2: Date;

  @Column public arrival2: Date;
}
