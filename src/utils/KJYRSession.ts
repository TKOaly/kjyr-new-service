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
  registration: KJYRRegistration;
}