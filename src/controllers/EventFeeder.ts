import * as WebSocket from 'ws';
import Person from '../models/Person';
/**
 * Dope class for sending real-time events via websocket connection
 */
export class EventFeeder {
  wss: WebSocket.Server;
  constructor() {}

  /**
   * Creates the websocket connection
   * @param {String} path ws path 
   */
  init(path: string) {
    this.wss = new WebSocket.Server({
      port: 4200,
      path
    });
  }

  /**
   * Sends an event
   * @param {Object} data Will be stringyfied to JSON
   */
  send(data: Event) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });    
  }
}

export class Event {
  constructor(
    public event: string,
    public cabinId: Number,
    public person: Person | { reservationUUID: string }
  ) {}
}
