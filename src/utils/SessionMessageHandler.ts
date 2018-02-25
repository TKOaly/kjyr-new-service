import { ExpressMiddlewareInterface } from "routing-controllers";

export default class SessionMessageHandler {
  use(request: any, response: any, next?: (err?: any) => any): any {
    if (request.session && request.method === 'GET') {
      if (request.session.message) {
        if (request.session.message.seen) {
          delete request.session.message;
        }
      }
    }
    next();
  }
}