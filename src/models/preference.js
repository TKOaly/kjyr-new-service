module.exports = function (sequalize, DataTypes) {
  const Preference = sequalize.define('preference', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER }
  }, {
      timestamps: false,
      classMethods: {
        associate: models => {
          Preference.belongsToMany(models.person, { through: 'person_preferences'});
        },
        createPöydät: () => {
          Preference.sync();
        }
      }
    });
  return Preference;
};