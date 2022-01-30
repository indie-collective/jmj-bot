function connect() {
  const ws = new WebSocket('wss://' + window.location.host);

  ws.onopen = function () {
    console.log('Connected to server');
  };

  ws.onmessage = function (event) {
    const { type, data } = JSON.parse(event.data);

    if (type === 'helloasso') {
      Queue.enqueue(() => playHelloAsso(data.name, data.donation, data.type));
    } else if (type === 'twitch') {
      if (data.reward.title === 'JMJ') {
        Queue.enqueue(() => playJMJ());
      } else if (data.reward.title === 'Apprends-moi Jamy !') {
        Queue.enqueue(() => playHelpMeJamy(data.user_name));
      }
    }
  };

  ws.onerror = function (err) {
    console.log('An error occured', err.message);
  };

  ws.onclose = function () {
    console.log('Disconnected from server, reconnecting...');

    setTimeout(function () {
      connect();
    }, 1000);
  };
}

connect();

function wait(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

async function playHelloAsso(name, donation, type) {
  console.log('Play HelloAsso');
  const divAlertFollower = document.getElementById('alert-helloasso');
  const spanAlertFollowerName = document.getElementById('alert-username');
  const spanAlertAction = document.getElementById('alert-action');
  const audioAlertSound = document.getElementById('alert-sound');
  const donationImg = document.getElementById('alert-helloasso-img-donation');
  const membershipImg = document.getElementById(
    'alert-helloasso-img-membership'
  );

  // show
  spanAlertFollowerName.innerText = name;

  if (type === 'membership') {
    spanAlertAction.innerText = " rejoint l'association";
    spanAlertAction.innerText += donation
      ? ' et fait un don de ' + donation + '€.'
      : '.';

    donationImg.style.display = 'none';
    membershipImg.style.display = '';
  } else if (type === 'donation') {
    spanAlertAction.innerText = ' fait un don de ' + donation + '€.';

    donationImg.style.display = '';
    membershipImg.style.display = 'none';
  } else {
    spanAlertAction.innerText = ' a encore fait tout bugger.';
  }

  divAlertFollower.classList.add('visible');
  audioAlertSound.play();

  await wait(10000);

  // hide
  divAlertFollower.classList.remove('visible');

  await wait(1000);
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

async function playHelpMeJamy(name) {
  console.log('Play Help Me Jamy');
  const container = document.getElementById('help-me-jamy');
  const spanAlertFollowerName = document.getElementById('alert-username');

  let tts = new Audio();
  document.body.appendChild(tts);

  async function setTTS() {
    const res = await fetch(
      'https://fr.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exsentences=1&explaintext=1&format=json&origin=*'
    );
    const data = await res.json();

    const { title, extract } = Object.values(data.query.pages)[0];

    const spokenText = `C'est quoi ${title} ? Eh bien, c'est très simple, ${extract}`;
    tts.src = `/tts?text=${spokenText}`;
    tts.playbackRate = 1.5;
  }

  await setTTS();

  tts.onerror = function (err) {
    console.log('An error occured loading TTS');
    setTTS();
  };

  await new Promise((resolve) => (tts.oncanplay = resolve));

  const video = document.getElementById('alert-jamy-video');

  // show
  spanAlertFollowerName.innerText = name;
  container.classList.add('visible');

  await new Promise((resolve) => {
    video.onended = function () {
      tts.onended = function () {
        resolve();
      };

      tts.play();
    };

    video.play();
  });

  // hide
  container.classList.remove('visible');
  tts.remove();
}

class Queue {
  static queue = [];
  static pendingPromise = false;

  static enqueue(promise) {
    return new Promise((resolve, reject) => {
        this.queue.push({
            promise,
            resolve,
            reject,
        });
        this.dequeue();
    });
  }

static dequeue() {
    if (this.workingOnPromise) {
      return false;
    }
    const item = this.queue.shift();
    if (!item) {
      return false;
    }
    try {
      this.workingOnPromise = true;
      item.promise()
        .then((value) => {
          this.workingOnPromise = false;
          item.resolve(value);
          this.dequeue();
        })
        .catch(err => {
          this.workingOnPromise = false;
          item.reject(err);
          this.dequeue();
        })
    } catch (err) {
      this.workingOnPromise = false;
      item.reject(err);
      this.dequeue();
    }
    return true;
  }
}
