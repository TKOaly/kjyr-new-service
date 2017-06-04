const MySQL = require('mysql');

module.exports = function () {
  var mysli = null;
  this.init = () => {
    mysli = MySQL.createConnection({
      host: Backend.Config.database.host,
      user: Backend.Config.database.user,
      password: Backend.Config.database.password,
      database: Backend.Config.database.database,
      port: Backend.Config.database.port
    });
  };

  this.getConnection = () => mysli;
};
