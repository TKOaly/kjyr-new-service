const WebSocket = require('ws');

/**
 * Dope class for sending real-time events via websocket connection
 */
class EventFeeder {
  constructor() {}

  /**
   * Creates the websocket connection
   * @param {String} path ws path 
   */
  init(path) {
    this.wss = new WebSocket.Server({
      port: 4200,
      path
    });
  }

  /**
   * Sends an event
   * @param {Object} data Will be stringyfied to JSON
   */
  send(data) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });    
  }
}

module.exports = EventFeeder;