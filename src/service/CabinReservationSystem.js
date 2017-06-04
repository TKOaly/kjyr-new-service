const EventFeeder = require('../controllers/EventFeeder');
const moment = require('moment');

var self;

class CabinReservationSystem extends EventFeeder {
  constructor() {
    super();
    this.init('/cabins');
    this.bucket = {};
    self = this;
    setInterval(() => {
      let now = new Date();
      for (let key in self.bucket) {
        let registration = self.bucket[key];
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
  registerPersonToCabin(person, cabinId) {
    self.bucket[person.reservationUUID] = {
      timestamp: new Date(),
      cabinId,
      person
    };
    self.send({
      event: 'ADD',
      cabinId,
      person: [person].map(p => ({
        reservationId: p.reservationUUID,
        firstname: p.firstname,
        lastname: p.lastname
      }))[0]
    });
  }

  /**
   * Removes a reservation from the bucket. Sends a REMOVE packet to the event feeder.
   * @param {*} reservationId 
   * @param {*} cabinId 
   */
  removePerson(reservationId, cabinId) {
    self.deletePersonFromBucket(reservationId, cabinId);
  }

  /**
   * Removes a reservation only from the bucket.
   * @param {*} cabinId 
   */
  completeRegistration(person) {
    delete self.bucket[person.reservationUUID];
    self.send({
      event: 'RESERVATION_COMPLETE',
      person: [person].map(p => ({
        reservationId: p.reservationUUID,
        firstname: p.firstname,
        lastname: p.lastname
      }))[0]
    });
  }

  /**
   * Gets amount of resercations for a cabin
   */
  getReservationCountForCabin(cabinId) {
    let res = 0;
    for (let key in self.bucket) {
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
  deletePersonFromBucket(reservationId, cabinId) {
    delete self.bucket[reservationId];
    self.send({
      event: 'REMOVE',
      cabinId,
      person: {
        reservationId
      }
    });
  }

  /**
   * Updates a value in the bucket and sends a update packet to the frontend
   */
  updateBucketValue(key, person) {
    let value = self.bucket[key];
    if (value) {
      value.person = person;
      self.bucket[key] = value;
      self.send({
        event: 'UPDATE',
        cabinId: value.cabinId,
        person: value.person
      });
    }
  }

  /**
   * Changes the cabin the user currently is in.s
   * @param {*} cabinId 
   * @param {*} reservationUUID 
   */
  changeCabinForUser(cabinId, reservationUUID) {
    let reservation = self.bucket[reservationUUID];
    if (reservation) {
      let startTime = reservation.timestamp;
      self.deletePersonFromBucket(reservationUUID, reservation.cabinId);
      self.bucket[reservation.person.reservationUUID] = {
        timestamp: startTime,
        cabinId,
        person: reservation.person
      };
      self.send({
        event: 'ADD',
        cabinId,
        person: [reservation.person].map(p => ({
          reservationId: p.reservationUUID,
          firstname: p.firstname,
          lastname: p.lastname
        }))[0]
      });
    }
  }
}

module.exports = CabinReservationSystem;