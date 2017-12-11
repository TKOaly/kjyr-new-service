class ContentService {
  constructor() {
    this.contentMap = {};
  }


  get(site, contentKey, locale) {
    try {
      return this.contentMap[site][contentKey][locale];
    } catch (e) {
      return null;
    }
  }

  updateFromDatabse() {
    Backend.Dao.sitecontent.findAll({
      include: Backend.Dao.content,
      raw: true
    }).then(contents => {
      let siteContentsMap = {};
      contents.forEach(item => {
        if (siteContentsMap[item.siteName]) {
          if (!siteContentsMap[item.siteName][item['contents.contentName']]) {
            siteContentsMap[item.siteName][item['contents.contentName']] = {};
          }
          siteContentsMap[item.siteName][item['contents.contentName']][item['contents.locale']] = item;
        } else {
          let object = {};
          object[item['contents.contentName']] = {};
          object[item['contents.contentName']][item['contents.locale']] = item;
          siteContentsMap[item.siteName] = object;
        }
      });
      this.contentMap = siteContentsMap;
    });
  }
}

module.exports = ContentService;