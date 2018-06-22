import { Event, EventFeeder } from "../controllers/EventFeeder";
import Person from "../models/Person";

let self;

class BucketItem {
  constructor(
    public timestamp: Date,
    public cabinId: number,
    public person: Person,
  ) {}
}

class CabinReservationSystem extends EventFeeder {
  public bucket: Map<string, BucketItem>;

  constructor() {
    super();
    this.init("/cabins");
    this.bucket = new Map();
    self = this;
    setInterval(() => {
      const now = new Date();
      for (const key in this.bucket.keys()) {
        const registration = this.bucket.get(key);
        if (registration) {
          if (
            now.getTime() - registration.timestamp.getTime() >=
            1000 * 60 * 3
          ) {
            self.deletePersonFromBucket(
              registration.person.reservationUUID,
              registration.cabinId,
            );
          }
        }
      }
    }, 1000);
  }

  /**
   * Adds a cabin reservation to the bucket. Also sends a packet to the event feeder with user
   * information for live updates on the website.
   * @param {*} person
   * @param {*} cabinId
   */
  public registerPersonToCabin(person: Person, cabinId: number) {
    this.bucket.set(
      person.reservationUUID,
      new BucketItem(new Date(), cabinId, person),
    );
    this.send(new Event("ADD", cabinId, person.getSafeForPublic()));
  }

  /**
   * Removes a reservation from the bucket. Sends a REMOVE packet to the event feeder.
   * @param {*} reservationId
   * @param {*} cabinId
   */
  public removePerson(reservationId: string, cabinId: number) {
    self.deletePersonFromBucket(reservationId, cabinId);
  }

  /**
   * Removes a reservation only from the bucket.
   * @param {*} cabinId
   */
  public completeRegistration(person: Person) {
    this.bucket.delete(person.reservationUUID);
    self.send(
      new Event(
        "RESERVATION_COMPLETE",
        person.cabinId,
        person.getSafeForPublic(),
      ),
    );
  }

  /**
   * Gets amount of resercations for a cabin
   */
  public getReservationCountForCabin(cabinId: number) {
    let res = 0;
    for (const key in this.bucket.keys()) {
      if (self.bucket[key].cabinId === cabinId) {
        res++;
      }
    }
    return res;
  }

  /**
   * Use removePerson instead.
   * @param {*} reservationId
   * @param {*} cabinId
   */
  public deletePersonFromBucket(reservationUUID: string, cabinId: number) {
    this.bucket.delete(reservationUUID);
    self.send(new Event("REMOVE", cabinId, { reservationUUID }));
  }

  /**
   * Updates a value in the bucket and sends a update packet to the frontend
   */
  public updateBucketValue(reservationUUID: string, person: Person) {
    const value = this.bucket.get(reservationUUID);
    if (value) {
      value.person = person;
      this.bucket.set(reservationUUID, value);
      self.send(new Event("UPDATE", value.cabinId, person.getSafeForPublic()));
    }
  }

  /**
   * Changes the cabin the user currently is in.s
   * @param {*} cabinId
   * @param {*} reservationUUID
   */
  public changeCabinForUser(cabinId, reservationUUID) {
    const reservation = this.bucket.get(reservationUUID);
    if (reservation) {
      const startTime = reservation.timestamp;
      self.deletePersonFromBucket(reservationUUID, reservation.cabinId);
      this.bucket.set(
        reservationUUID,
        new BucketItem(startTime, cabinId, reservation.person),
      );
      self.send(new Event("ADD", cabinId, reservation.person));
    }
  }
}

module.exports = CabinReservationSystem;
