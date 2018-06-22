import { KJYRFlashMessage } from "./KJYRSession";

export default class SessionMessageHandler {
  public use(request: any, response: any, next?: (err?: any) => any): any {
    if (request.session && request.method === "GET") {
      if (request.session.message) {
        request.session.message = new KJYRFlashMessage(
          request.session.message.type,
          request.session.message.seen,
          request.session.message.content,
        );
        if (request.session.message.seen) {
          delete request.session.message;
        }
      }
    }
    next();
  }
}
