const ws = new WebSocket('ws://localhost:8080');

ws.onopen = function () {
  console.log('Connected to server');
};

ws.onmessage = function (event) {
  const { type, data } = JSON.parse(event.data);

  if (type === 'twitch') {
    if (data.reward.title === 'JMJ') {
      playJMJ();
    }
  }
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


async function playJMJ() {
  console.log('Play JMJ');
  const divJMJ = document.getElementById('jmj');

  // show
  divJMJ.classList.add('visible');

  await wait(7000);

  // hide
  divJMJ.classList.remove('visible');

  await wait(1000);
}
