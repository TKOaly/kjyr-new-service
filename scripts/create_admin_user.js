const mysql = require('mysql');
const config = require('../src/config/config');
const bcrypt = require('bcrypt');
const FS = require('fs');

const connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port
});

connection.connect();
const pw = Math.random().toString(36).slice(-8);
const salt = bcrypt.hashSync(pw, 10);
connection.query('insert into admins (username, passwordSalt, studOrg) values ("admin", "' + salt + '", 0)', (err, res) => {
  if (!err) {
    FS.writeFileSync('admin_user.txt',`USERNAME: admin\nPASSWORD: ${pw}`);
    console.log('Check admin_user.txt!');
    process.exit(0);
  } else throw err;
});
