module.exports = function (sequalize, DataTypes) {
  const Person = sequalize.define('persons', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstname: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATE },
    email: { type: DataTypes.STRING },
    studorgId: { type: DataTypes.INTEGER, foreignKey: true },
    cabinId: { type: DataTypes.INTEGER, foreignKey: true },
    guardian: { type: DataTypes.INTEGER },
    nationality: { type: DataTypes.STRING },
    preferenceId: { type: DataTypes.INTEGER, foreignKey: true },
    reservationUUID: { type: DataTypes.STRING, unique: true },
    ts: { type: DataTypes.DATE }
  }, {
      timestamps: false,
      freezeTableName: true,
      classMethods: {
        associate: models => {
          Person.belongsTo(models.studorg);
          Person.belongsTo(models.cabins);
          Person.belongsToMany(models.preference, { through: 'person_preferences' });
        },
        createPöydät: () => {
          Person.sync();
        }
      }
    });
  return Person;
};