import { Sequelize, ISequelizeConfig } from 'sequelize-typescript';
import * as models from './models/Models';

export class Database {
  sequelize: Sequelize;
  constructor(opts: ISequelizeConfig) {
    this.sequelize = new Sequelize(opts);
    this.sequelize.addModels(Object.keys(models).map(key => models[key]));
  }

}
