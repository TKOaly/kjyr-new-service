import Person from '../models/Person';
import { EventFeeder, Event } from '../controllers/EventFeeder';

const moment = require('moment');

var self;

class BucketItem {
  constructor(
    public timestamp: Date,
    public cabinId: Number,
    public person: Person) { }
}

class CabinReservationSystem extends EventFeeder {
  bucket: Map<String, BucketItem>

  constructor() {
    super();
    this.init('/cabins');
    this.bucket = new Map();
    self = this;
    setInterval(() => {
      let now = new Date();
      for (let key in this.bucket.keys()) {
        let registration = this.bucket.get(key);
        if (registration) {
          if ((now.getTime() - registration.timestamp.getTime()) >= (1000 * 60 * 3)) {
            self.deletePersonFromBucket(registration.person.reservationUUID, registration.cabinId);
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
  registerPersonToCabin(person: Person, cabinId: Number) {
    this.bucket.set(person.reservationUUID, new BucketItem(new Date(), cabinId, person));
    this.send(new Event('ADD', cabinId, person.getSafeForPublic()));
  }

  /**
   * Removes a reservation from the bucket. Sends a REMOVE packet to the event feeder.
   * @param {*} reservationId 
   * @param {*} cabinId 
   */
  removePerson(reservationId: string, cabinId: Number) {
    self.deletePersonFromBucket(reservationId, cabinId);
  }

  /**
   * Removes a reservation only from the bucket.
   * @param {*} cabinId 
   */
  completeRegistration(person: Person) {
    this.bucket.delete(person.reservationUUID);
    self.send(new Event('RESERVATION_COMPLETE', person.cabinId, person.getSafeForPublic()));
  }

  /**
   * Gets amount of resercations for a cabin
   */
  getReservationCountForCabin(cabinId: Number) {
    let res = 0;
    for (let key in this.bucket.keys()) {
      if (self.bucket[key].cabinId == cabinId)
        res++;
    }
    return res;
  }

  /**
   * Use removePerson instead.
   * @param {*} reservationId 
   * @param {*} cabinId 
   */
  deletePersonFromBucket(reservationUUID: string, cabinId: Number) {
    this.bucket.delete(reservationUUID);
    self.send(new Event('REMOVE', cabinId, { reservationUUID }));
  }

  /**
   * Updates a value in the bucket and sends a update packet to the frontend
   */
  updateBucketValue(reservationUUID: string, person: Person) {
    let value = this.bucket.get(reservationUUID);
    if (value) {
      value.person = person
      this.bucket.set(reservationUUID, value);
      self.send(new Event('UPDATE', value.cabinId, person.getSafeForPublic()))
    }
  }

  /**
   * Changes the cabin the user currently is in.s
   * @param {*} cabinId 
   * @param {*} reservationUUID 
   */
  changeCabinForUser(cabinId, reservationUUID) {
    let reservation = this.bucket.get(reservationUUID);
    if (reservation) {
      let startTime = reservation.timestamp;
      self.deletePersonFromBucket(reservationUUID, reservation.cabinId);
      this.bucket.set(reservationUUID, new BucketItem(startTime, cabinId, reservation.person));
      self.send(new Event('ADD', cabinId, reservation.person));
    }
  }
}

module.exports = CabinReservationSystem;