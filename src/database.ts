import { Sequelize, ISequelizeConfig } from 'sequelize-typescript';

export default class Database {
  sequelize: Sequelize;
  constructor(opts: ISequelizeConfig) {
    this.sequelize = new Sequelize(opts);
    console.log('asdpasd1');
    this.sequelize.addModels([__dirname + '/models']);
    console.log('asdpasd2');
    this.sequelize.sync().then(() => console.log('done')).catch(e => console.log(e));
    console.log('asdpasd');
  }

}
