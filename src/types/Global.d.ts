declare namespace NodeJS {
  export interface Global {
    Backend: {
      Config: any
      Localization: any
      Logger: any
      Models: any,
    };
  }
}
