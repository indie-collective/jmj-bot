const { WebSocketServer, WebSocket } = require('ws');

const wss = new WebSocketServer({
  noServer: true,
});

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', function connection(ws) {
  console.log('new connection !');

  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});

wss.sendMessage = (message) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = wss;
