const { WebSocketServer, WebSocket } = require('ws');

const wss = new WebSocketServer({
  // noServer: true,
  // path: '/',
  port: 8080,
});

wss.on('connection', function connection(ws) {
  console.log('new connection !');
});

wss.sendMessage = (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = wss;