import { Sequelize, ISequelizeConfig } from 'sequelize-typescript';

export default class Database {
  sequelize: Sequelize;
  constructor(opts: ISequelizeConfig) {
    this.sequelize = new Sequelize(opts);
    this.sequelize.addModels([__dirname + '/models']);
    this.sequelize.sync().then(() => console.log('done')).catch(e => console.log(e));
  }

}
