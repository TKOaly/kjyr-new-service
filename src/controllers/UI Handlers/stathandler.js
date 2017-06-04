const moment = require('moment');
const localization = require('../../config/localization.json');

module.exports = new StatHandler();

function StatHandler() {
  this.handleGetRequest = function (req, res) {
    Backend.Dao.studorg.findAll({
      include: Backend.Dao.person
    }).then(qRes => {
      generateStats(qRes, stats => {
        res.render('stats', {
          stats,
          config: Backend.Config,
          userLanguage: req.session.lang,
          locale: localization[req.session.lang === undefined ? 'fi' : req.session.lang]
        });
      });
    }).catch(e => {
      console.log(e);
      throw new Error('Paskaks meni');
    })
  };

/**
 * Formats and maps data from query result
 * @param {Object} qRes result of the sequelize query
 * @param {Function} cb callback that returns stats of everything
 */
  function generateStats(qRes, cb) {
    let studOrgs = {};
    let cruiseOrg = {
      name: '',
      attendantCount: 0,
      totalFreeSlots: 0,
      usersUnderage: 0,
      guardians: 0,
    };

    Backend.Dao.cruise.findAll({
      attributes: ['departure1']
    }).then(departure => {
      qRes.forEach(studorg => {
        studorg = studorg.dataValues;
        studorg.persons = studorg.persons.map(p => p.dataValues);
        studorg.persons.forEach(person => {
          if (person.cabinId === null) return;
          // Since the tables are joined, we need to do a little bit of processing here.
          let dateOfBirth = new Date(person.dob);
          let diff = moment.duration(
            moment(departure[0].dataValues.departure1).diff(dateOfBirth)
          );

          cruiseOrg.attendantCount++;
          cruiseOrg.usersUnderage += diff.asYears() < 18 ? 1 : 0;
          cruiseOrg.guardians += person.guardian === 1 ? 1 : 0;
          if (!studOrgs[studorg.name]) {
            let dateOfBirth = moment(person.dob);
            cruiseOrg.totalFreeSlots += studorg.quota * 4;
            studOrgs[studorg.name] = {
              name: studorg.name,
              attendantCount: 1,
              totalFreeSlots: studorg.quota * 4,
              usersUnderage: diff.asYears() < 18 ? 1 : 0,
              guardians: studorg.guardian_quota === 1 ? 1 : 0
            };
          } else {
            studOrgs[studorg.name].attendantCount++;
            studOrgs[studorg.name].usersUnderage += diff.asYears() < 18 ? 1 : 0;
            studOrgs[studorg.name].guardians += person.guardian === 1 ? 1 : 0;
          }
        });
      });
      cb({
        studOrgs,
        cruiseOrg
      })
    });
  }
}