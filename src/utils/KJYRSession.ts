import StudentOrganization from '../models/StudentOrganization';
import Person from '../models/Person';

export class KJYRRegistration {
  step: number;
  person: Person;
  constructor() { }
}

export class KJYRAuth {
  constructor(
    public role: string,
    public studentOrganization: StudentOrganization) { }
}

export class KJYRFlashMessage {
  constructor(
    public type: 'danger' | 'info' | 'success',
    public seen: boolean,
    public content: string) { }

   displayAndDispose() {
    this.seen = true;
    return this.content;
  }
}

export interface KJYRSession extends Express.Session {
  lang: string;
  auth: KJYRAuth;
  message: KJYRFlashMessage;
  registration: KJYRRegistration;
}

export function flashMessage(session: KJYRSession, type: 'danger' | 'info' | 'success', content: string) {
  session.message = new KJYRFlashMessage(type, false, content);
}