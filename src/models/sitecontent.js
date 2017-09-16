module.exports = function (sequalize, DataTypes) {
  const SiteContent = sequalize.define('sitecontent', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    siteName: { type: DataTypes.STRING }
  }, {
      timestamps: false,
      classMethods: {
        associate: models => {
            SiteContent.hasMany(models.content);
        },
        createPöydät: () => {
          SiteContent.sync();
        }
      }
    });
  return SiteContent;
};