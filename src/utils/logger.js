const winston = require('winston');
const FS = require('fs');

var self;

function rollbackQueryGen(query) {
  if (query.action) {
    switch(query.action) {
      case 'insert':
        return `DELETE FROM ${query.tableName} WHERE ${query.reference} ${query.operation || '='} ${query.value} ${query.rawEndSequence ? query.rawEndSequence : ''}`;
      case 'update':
        let changeString = Object.keys(query.newObject).map(key => {
          let val = query.oldObject[key];
          let isStr = typeof val === 'string';
          return `${key} = ${isStr ? '"' + val + '"' : val}`;
        }).join(',');
        return `UPDATE ${query.tableName} SET ${changeString} WHERE ${query.reference} ${query.operation || '='} ${query.value}`
      case 'delete': {
        let valueDefinitionString = '(' + Object.keys(query.oldObject).join(', ') + ')';
        let valueString = '(' + Object.keys(query.oldObject).map(key => query.oldObject[key]).join(', ') + ')';
        return `INSERT INTO ${query.tableName} ${valueDefinitionString} VALUES ${valueString}`;
      }
    }
  }
}

class Logger {
  constructor() {
    if (!FS.existsSync('./logs'))
      FS.mkdirSync('./logs')
    this.winston = new winston.Logger({
      transports: [
        new winston.transports.File({ filename: './logs/kjyr_registration_system_log', maxsize: 10000000, json: false })
      ]
    });
    self = this;
  }

  log(content, level) {
    self.winston[level || 'info'](content);
  }

  rollbackQueryLog(content, query) {
    this.winston.info(`${content}   ROLLBACK: ${rollbackQueryGen(query)}`);
  }

}

module.exports = Logger;