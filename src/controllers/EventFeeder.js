const WebSocket = require('ws');

class EventFeeder {
  constructor() {}

  init(path) {
    this.wss = new WebSocket.Server({
      port: 4200,
      path
    });
  }

  send(data) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });    
  }
}

module.exports = EventFeeder;