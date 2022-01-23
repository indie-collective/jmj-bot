const ws = new WebSocket('ws://localhost:8080');

ws.onopen = function () {
  console.log('Connected to server');
};

ws.onmessage = function (event) {
  const { type, data } = JSON.parse(event.data);

};

ws.onerror = function () {
  console.log('An error occured');
};

ws.onclose = function () {
  console.log('Disconnected from server');
};

function wait(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}
