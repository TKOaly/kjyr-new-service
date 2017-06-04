module.exports = function (sequalize, DataTypes) {
  const Cabin = sequalize.define('cabin', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: DataTypes.INTEGER },
    studorgId: { type: DataTypes.INTEGER, foreignKey: true },
  }, {
      timestamps: false,
      classMethods: {
        associate: models => {
          Cabin.belongsTo(models.studorg);
          Cabin.hasMany(models.person);
        },
        createPöydät: () => {
          Cabin.sync();
        }
      }
    });
  return Cabin;
};