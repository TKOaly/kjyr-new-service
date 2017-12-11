const bcrypt = require('bcrypt');
const FS = require('fs');

const pw = Math.random().toString(36).slice(-8);
const salt = bcrypt.hashSync(pw, 10);

FS.writeFileSync('admin_user.txt', `USERNAME: admin\nPASSWORD: ${pw}\nSALT: ${salt}`);
console.log('Check admin_user.txt!');