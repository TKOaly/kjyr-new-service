const locale = require('../config/localization.json');
const nodemailer = require('nodemailer');
const moment = require('moment');

let transporter = nodemailer.createTransport({
  host: process.env.KJYR_MAIL_HOST,
  port: process.env.KJYR_MAIL_PORT
});

module.exports = function sendEmail(address, person, lang) {
  moment.locale(lang);
  createTimetable(lang).then(timetable => {

    let emailMessage = locale[lang].infomail_head + '\r\n\r\n';
    emailMessage += timetable;
    emailMessage += locale[lang].infomail_para_1 + '\r\n\r\n';
    emailMessage += locale[lang].infomail_para_2 + '\r\n\r\n';
    emailMessage += locale[lang].infomail_para_3 + '\r\n\r\n';
    emailMessage += locale[lang].infomail_para_4 + '\r\n\r\n\r\n';
    emailMessage += locale[lang].infomail_footer;

    transporter.sendMail({
      from: `KJYR'${Backend.Config.year_abbreviation} <risteilyvastaava@tko-aly.fi`,
      to: address,
      subject: locale[lang].infomail_subject,
      text: emailMessage
    }, (err, info) => {
      if (err) {
        Backend.Logger.log(`Error: infomail not sent to ${address}.`);
        Backend.Logger.log(err);
      } else
      Backend.Logger.log(`Error: infomail sent to ${address}.`);
    })
  }).catch(e => {
    Backend.Logger.log('Error was thrown while building timetable');
    Backend.Logger.log(e);
  });
};

function createTimetable(lang) {
  return Backend.Dao.cruise.findOne({
    where: {
      id: 1
    }
  }).then(cruise => {
    if (!cruise) {
      throw new Error('Cruise not found');
    }

    let str = `${locale[lang].infomail_dep_1}  ${moment(cruise.departure_1).format('LLLL')}\r\n`;
    str += `${locale[lang].infomail_arr_1}  ${moment(cruise.arrival_1).format('LLLL')}\r\n`;
    str += `${locale[lang].infomail_dep_2}  ${moment(cruise.departure_2).format('LLLL')}\r\n`;
    str += `${locale[lang].infomail_arr_2}  ${moment(cruise.arrival_2).format('LLLL')}\r\n\r\n`;
    return str;
  });
}