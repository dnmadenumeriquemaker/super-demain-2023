
const DEBUG = true;
const ENABLE_ARDUINO = false;
const NB_LEDS_JAUGE = 66;


let IS_ARDUINO_OK = false;
let CAN_AUDIO = false;

const STEP_WAIT = 0;
const STEP_COUNTDOWN = 1;
const STEP_PLAY = 2;
const STEP_END = 3;

const GAME_DURATION = 90;

let step = null;

let font;

// Arduino
let port;

let countdown;
let timerCountdown = null;

let gameDuration = 0;
let timerPlay = null;

let jauge;
let jaugeStep = 3;
let jaugeMax = NB_LEDS_JAUGE;
let jaugeMalus = 5;
let jaugeBonus = 5;

let jaugeSpeed;
let jaugeSpeedStart = 1000; // la jauge augmente toutes les secondes
let jaugeSpeedMax = 500; // la jauge augmente toutes les 1/2 secondes
let timerJaugeTick = null;

let fakeButtons = [];

let timerRound = null;
let intervalTickRound = 100; // tick every 100ms
let durationRound = 0;
let durationRoundMax = 2 * 1000; // 6 secondes

let currentButtonLetterToPress = null;

let buttons = new Array(24).fill(false);

const dashboards = {
  'A': [0, 1, 2, 3],
  'B': [4, 5, 6, 7],
  'C': [8, 9, 10, 11],
  'D': [12, 13, 14, 15],
  'E': [16, 17, 18, 19],
  'F': [20, 21, 22, 23],
};

const buttonsToDashboard = {
  0: 'A', 1: 'A', 2: 'A', 3: 'A',
  4: 'B', 5: 'B', 6: 'B', 7: 'B',
  8: 'C', 9: 'C', 10: 'C', 11: 'C',
  12: 'D', 13: 'D', 14: 'D', 15: 'D',
  16: 'E', 17: 'E', 18: 'E', 19: 'E',
  20: 'F', 21: 'F', 22: 'F', 23: 'F'
};

const oppositeDashboardsOfDashboard = {
  'A': ['C', 'D', 'E'],
  'B': ['D', 'E', 'F'],
  'C': ['A', 'E', 'F'],
  'D': ['A', 'B', 'F'],
  'E': ['A', 'B', 'C'],
  'F': ['B', 'C', 'D'],
}

let audios = {};

const audiosList = [
  'wait_loop',
  'button_pressed',
  'positive_feedback',
  'negative_feedback',
  'jauge_bonus',
  'jauge_malus',
  'end',
  'end_loop',
];

function preload() {
  // font = loadFont('./assets/Dela.ttf');

  audiosList.forEach(audioName => {
    audios[audioName] = document.getElementById(audioName);
  });
}


function setup() {
  createCanvas(2160, 2160);
  background(0);
  // textFont(font);

  if (ENABLE_ARDUINO) {

    port = createSerial();

    // in setup, we can open ports we have used previously
    // without user interaction

    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
      port.open(usedPorts[0], 57600);
    }

  }
}

function draw() {

  if (mouseIsPressed && !CAN_AUDIO) {
    CAN_AUDIO = true;

    if (DEBUG) {
      setStep(STEP_WAIT);
      setStep(STEP_PLAY);
    }
  }

  // Initialize
  if (step == null) {
    push();
    background(0);
    textAlign(CENTER);

    if (ENABLE_ARDUINO) {
      if (!IS_ARDUINO_OK) {
        textSize(30);
        fill(255, 0, 0);
        text("Arduino non détectée\r\nRechargez la page ou appuyez sur la touche [b] pour connecter", width / 2, height / 2);

      } else {
        textSize(30);
        fill(0, 255, 0);
        text("Arduino détectée\r\nCliquez n'importe où\r\npour démarrer le dispositif", width / 2, height / 2);
      }
    }
    else {
      textSize(40);
      fill(255);
      text("Cliquez n'importe où\r\npour démarrer le dispositif", width / 2, height / 2);
    }

    pop();

    if ((!ENABLE_ARDUINO && (mouseIsPressed || keyIsPressed))
      || (ENABLE_ARDUINO && IS_ARDUINO_OK)) {
      setStep(STEP_WAIT);
    }


    if (ENABLE_ARDUINO) {
      // changes button label based on connection status
      if (!port.opened()) {
        IS_ARDUINO_OK = false;
        console.log('Waiting for Arduino');
      } else {
        IS_ARDUINO_OK = true;
        console.log('Connected');
      }
    }

    return;
  }

  if (ENABLE_ARDUINO) {
    let val = port.readUntil("\n");

    if (val.length > 0) {
      let vals = val.split('/');

      console.log(vals);

      // pot1 = int(vals[0]);
      // pot2 = int(vals[1]);
      // dist1 = int(vals[2]);
      // dist2 = int(trim(vals[3]));
    }
  } else {
    // Mode without Arduino
    // console.log('Mode without Arduino');


  }






  background(0, 0, 0);

  if (step == STEP_WAIT) {

  }

  if (step == STEP_COUNTDOWN) {

  }

  if (step == STEP_PLAY) {

  }

  if (step == STEP_END) {

  }
}

function keyPressed() {
  if (key == "w") {
    setStep(STEP_WAIT);
  }
  if (key == "c") {
    setStep(STEP_COUNTDOWN);
  }
  if (key == "p") {
    setStep(STEP_PLAY);
  }
  if (key == "e") {
    setStep(STEP_END);
  }
}




function setStep(newStep) {
  step = newStep;

  if (newStep == STEP_WAIT) {
    initGame();

    playAudio('wait_loop');
  }

  if (newStep == STEP_COUNTDOWN) {
    countdown = 3;

    clearInterval(timerCountdown);
    timerCountdown = setInterval(function () {
      countdown--;

      if (countdown <= 0) {
        setStep(STEP_PLAY);
      }
    }, 1000);
  }



  if (newStep == STEP_PLAY) {

    newRound();

    // jauge, accelerating
    clearInterval(timerJaugeTick);
    timerJaugeTick = setInterval(function () {
      jauge += jaugeStep;
      checkJauge();
    }, jaugeSpeed);

    // time
    clearInterval(timerPlay);
    timerPlay = setInterval(function () {
      gameDuration++;
    }, 1000);
  }



  if (newStep == STEP_END) {
    endGame();
  }
}

function initGame() {
  jauge = 0;
  jaugeSpeed = jaugeSpeedStart;
  gameDuration = 0;
  durationRound = 0;
}



function endRound() {
  console.log('Fin du round');
  checkJauge(function () {
    newRound();
  });
}


function newRound() {
  console.log('Nouveau round');
  clearFakeButtons();
  setNewActiveButtons();

  durationRound = 0;

  // start round timer
  clearInterval(timerRound);
  timerRound = setInterval(function () {
    durationRound += intervalTickRound;
    checkJauge();

    // players has not triggered the buttons in time
    if (durationRound >= durationRoundMax) {
      tooLate();
    }
  }, intervalTickRound);
}



function clearFakeButtons() {
  fakeButtons = [];
}



function setNewActiveButtons() {

  let activeButton1 = floor(random(buttons.length));

  // éviter que ce soit les mêmes boutons qu'avant
  while (buttons[activeButton1] === true) {
    activeButton1 = floor(random(buttons.length));
  }

  let dashboardActiveButton1 = buttonsToDashboard[activeButton1];

  let potentialButtonsForActiveButton2 = [];

  oppositeDashboardsOfDashboard[dashboardActiveButton1].forEach(dashboard => {
    potentialButtonsForActiveButton2 = potentialButtonsForActiveButton2.concat(dashboards[dashboard]);
  });

  let activeButton2 = potentialButtonsForActiveButton2[floor(random(potentialButtonsForActiveButton2.length))];

  // éviter que ce soit les mêmes boutons qu'avant
  while (buttons[activeButton2] === true) {
    activeButton2 = potentialButtonsForActiveButton2[floor(random(potentialButtonsForActiveButton2.length))];
  }

  buttons = new Array(24).fill(false);
  buttons[activeButton1] = true;
  buttons[activeButton2] = true;

  if (DEBUG) {
    console.warn('Boutons ' + activeButton1 + ' et ' + activeButton2);
  }
}

// players has not triggered the buttons in time
function tooLate() {
  console.log('Pas assez rapides pour ce round !');
  setJaugeMalus();
  endRound();
}

function setJaugeMalus() {
  jauge += jaugeMalus;
}

function setJaugeBonus() {
  jauge -= jaugeBonus;
}


function checkJauge(cb = function () { }) {
  jauge = max(jauge, 0); // on évite le jauge négatif

  // TODO: send jauge to Arduino
  // console.warn('Jauge : ' + jauge);

  if (jauge >= jaugeMax) {
    console.log('La jauge a explosée !');
    setStep(STEP_END);
  } else {
    cb();
  }
}

// is called when STEP_END
function endGame() {
  clearInterval(timerJaugeTick);
  clearInterval(timerPlay);
  clearInterval(timerRound);
}

function playAudio(audio) {
  if (!CAN_AUDIO) return;

  stopAudio(audios[audio]);
  audios[audio].play();
}

function stopAudio(audio) {
  if (!CAN_AUDIO) return;

  if (audios[audio]) {
    audios[audio].pause();
    audios[audio].currentTime = 0.00001;
  }
}

function stopAllAudios() {
  audiosList.forEach(audioName => {
    stopAudio(audioName);
  });
}