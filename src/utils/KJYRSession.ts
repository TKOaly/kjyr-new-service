import StudentOrganization from '../models/StudentOrganization';
import Person from '../models/Person';

export class KJYRRegistration {
  step: number;
  person: Person;
  constructor() {}
}

export class KJYRAuth {
  constructor(
    public role: string, 
    public studentOrganization: StudentOrganization) {}
}

export interface KJYRSession extends Express.Session {
  lang: string;
  auth: KJYRAuth;
  message: {
    type: 'danger' | 'info' | 'success',
    seen: boolean,
    content: string
  };
  registration: KJYRRegistration;
}

export function flashMessage(session: KJYRSession, type: 'danger' | 'info' | 'success', content: string) {
  session.message = {
    type,
    seen: false,
    content
  };
}