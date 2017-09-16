module.exports = function (sequalize, DataTypes) {
  const Content = sequalize.define('content', {
    sitecontentId: { type: DataTypes.INTEGER, foreignKey: true },
    locale: { type: DataTypes.STRING },
    contentName: { type: DataTypes.STRING },
    text: { type: DataTypes.TEXT }
  }, {
      timestamps: false,
      classMethods: {
        associate: models => {
          Content.belongsTo(models.sitecontent);
        },
        createPöydät: () => {
          Content.sync();
        }
      }
    });
  return Content;
};