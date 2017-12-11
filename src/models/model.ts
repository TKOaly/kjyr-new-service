import * as Sequelize from "sequelize";
import * as path from "path";

const sequelize: Sequelize.Sequelize = new Sequelize(
  global.Backend.Config.database.database,
  global.Backend.Config.database.user,
  global.Backend.Config.database.password,
  {
    host: global.Backend.Config.database.host,
    port: global.Backend.Config.database.port,
    dialect: 'sqlite',
    storage: 'mayhem.sqlite',
    logging: content => { global.Backend.Logger.log(content, 'info'); }
  }
);

var db: any = {};

/*
interface Db {
  cruise: Sequelize.Model<{},{}>,
  studorg: Sequelize.Model<{},{}>,
  cabins: Sequelize.Model<{},{}>,
  person: Sequelize.Model<{},{}>,
  preference: Sequelize.Model<{},{}>,
  admin: Sequelize.Model<{},{}>,
  sequelize: Sequelize.Sequelize
}*/

// Load models
db.cruise = sequelize.import(path.join(__dirname, 'cruise.js'));
db.studorg = sequelize.import(path.join(__dirname, 'studorg.js'));
db.cabins = sequelize.import(path.join(__dirname, 'cabin.js'));
db.person = sequelize.import(path.join(__dirname, 'person.js'));
db.preference = sequelize.import(path.join(__dirname, 'preference.js'));
db.admin = sequelize.import(path.join(__dirname, 'admin.js'));

db.sequelize = sequelize;

db.cruise.createPöydät();
db.studorg.createPöydät();
db.cabins.createPöydät();
db.preference.createPöydät();
db.person.createPöydät();
db.admin.createPöydät();

Object.keys(db).forEach(elem => {
  if (db[elem].associate)
    db[elem].associate(db);
});

module.exports = db;