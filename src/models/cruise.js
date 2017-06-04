module.exports = function (sequalize, DataTypes) {
  const Cruise = sequalize.define('cruise', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ship: { type: DataTypes.STRING },
    departure1: { type: DataTypes.DATE },
    arrival1: { type: DataTypes.DATE },
    departure2: { type: DataTypes.DATE },
    arrival2: { type: DataTypes.DATE } 
  }, {
    timestamps: false,
    underscored: false,
    classMethods: {
        createPöydät: () => {
          Cruise.sync();
        }
    }
  });
  return Cruise;
};