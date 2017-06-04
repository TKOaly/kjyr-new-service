module.exports = function (sequalize, DataTypes) {
  const Admin = sequalize.define('admin', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING },
    passwordSalt: { type: DataTypes.STRING },
    studOrg: { type: DataTypes.INTEGER }
  }, {
    timestamps: false,
    underscored: false,
    classMethods: {
        createPöydät: () => {
          Admin.sync();
        }
    }
  });
  return Admin;
};