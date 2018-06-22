import * as localization from "../config/localization.js";

export default class LocalizedInputError extends Error {
  constructor(private errorKey: string) {
    super("");
  }

  public getLocalizedErrorMessage(locale) {
    return localization[locale][this.errorKey];
  }
}
