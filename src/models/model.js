const Sequelize = require('sequelize');
const path = require('path');
const sequelize = new Sequelize(
  Backend.Config.database.database,
  Backend.Config.database.user,
  Backend.Config.database.password,
  {
    host: Backend.Config.database.host,
    port: Backend.Config.database.port,
    dialect: 'mysql',
    logging: content => { Backend.Logger.log(content, 'info'); }
  }
);

var db = {};

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