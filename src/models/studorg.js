module.exports = function (sequalize, DataTypes) {
  const Studorg = sequalize.define('studorg', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    quota: { type: DataTypes.INTEGER },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    guardian_quota: { type: DataTypes.INTEGER },
    cabin_quota: { type: DataTypes.INTEGER },
    cabin_price: { type: DataTypes.INTEGER },
    ilmo_start: { type: DataTypes.DATE }
  }, {
      timestamps: false,
      classMethods: {
        associate: models => {
          Studorg.hasMany(models.cabins);
          Studorg.hasMany(models.person);
        },
        createPöydät: () => {
          Studorg.sync();
        }
      }
    });
  return Studorg;
};