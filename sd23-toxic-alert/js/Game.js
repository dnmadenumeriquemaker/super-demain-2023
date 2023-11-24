
const DEBUG = true;
const ENABLE_ARDUINO = true;
const NB_LEDS_JAUGE = 54;

let IS_ARDUINO_OK = false;
let CAN_AUDIO = false;

const STEP_WAIT = 0;
const STEP_COUNTDOWN = 1;
const STEP_PLAY = 2;
const STEP_END = 3;

let step = null;

let font;

// Arduino
let port;

let arduinoTick = 0;
let timerWait = null;
let timerWaitJaugeLevel = 0;

let countdown;
let timerCountdown = null;

let countdownEnd;
let timerCountdownEnd = null;

let gameDuration = 0;
let timerPlay = null;

let jauge;
let jaugeStep = 1;
let jaugeMax = NB_LEDS_JAUGE;
let jaugeMalus = 5;
let jaugeBonus = 5;

let jaugeSpeed;
let jaugeSpeedStart = 1500; // la jauge augmente toutes les secondes 1/2
let jaugeSpeedMax = 500; // la jauge augmente toutes les 1/2 secondes
let timerJaugeTick = null;

let fakeButtons = [];

let timerRound = null;
let intervalTickRound = 100; // tick every 100ms
let durationRound = 0;
let durationRoundMax; // 6 secondes

let currentButtonLetterToPress = null;

let buttons = new Array(24).fill(0);
let activeButtons = [];
let prevButtonsStates = new Array(24).fill(0);

let startButton1 = 4;
let startButton2 = 17;

const dashboardsLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

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

const dashboardButtonsPositions = [
  [-35, 160],
  [35, 160],
  [-45, 240],
  [45, 240],
];

let audios = {};

const audiosList = [
  'wait_loop',
  'countdown',
  'button_pressed',
  'positive_feedback',
  'negative_feedback',
  'jauge_bonus',
  'jauge_malus',
  'tick',
  'alarm',
  'end',
  'end_ia',
];

function getFakeButtonsMinMaxCount() {

  if (jauge < 18) {
    return [1, 3];
  }

  if (jauge < 30) {
    return [3, 5];
  }

  if (jauge < 42) {
    return [5, 10];
  }

  return [8, 18];
}



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
      console.log(usedPorts);
      port.open(usedPorts[0], 9600);
    }

    if (!port.opened()) {
      connectBtn = createButton('Connect to Arduino');
      connectBtn.position(80, 200);
      connectBtn.mousePressed(connectBtnClick);
    }
  }
}

function connectBtnClick() {
  if (!port.opened()) {
    port.open('Arduino', 9600);
  } else {
    port.close();
  }
}

function draw() {


  if (IS_ARDUINO_OK) {
    let str = port.readUntil("\n");
    if (str.length > 0) {
      arduinoTick++;
      if (arduinoTick > 20) {
        arduino_gotButtons(str);
      }
    }

    connectBtn.hide();
  }

  if (mouseIsPressed && !CAN_AUDIO) {
    CAN_AUDIO = true;
    // setStep(STEP_WAIT);
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
      || (ENABLE_ARDUINO && IS_ARDUINO_OK)
      && CAN_AUDIO) {
      setStep(STEP_WAIT);
    }


    if (ENABLE_ARDUINO) {
      // changes button label based on connection status
      if (!port.opened()) {
        IS_ARDUINO_OK = false;
        debug('Waiting for Arduino', 'orange');
      } else {
        IS_ARDUINO_OK = true;
        debug('Connected', 'green');
      }
    }

    return;
  }

  /*
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
  */






  background(0, 0, 0);

  if (step == STEP_WAIT) {

  }

  if (step == STEP_COUNTDOWN) {

  }

  if (step == STEP_PLAY) {
    dashboardsLetters.forEach((dashboardLetter, index) => {
      push();
      translate(width / 2, height / 2);
      rotate(radians(index * -60));

      fill('#1a172e');
      triangle(175, 300, -175, 300, 0, 0);

      dashboards[dashboardLetter].forEach((button, index) => {
        push();
        translate(
          dashboardButtonsPositions[index][0],
          dashboardButtonsPositions[index][1]
        );

        // is active button
        if (buttons[button] == 1) {
          fill('#00FF00');
          noStroke();
        }

        // is fake button
        else if (fakeButtons.includes(button)) {
          if (frameCount % 30 < 15) {
            fill('#FF0000');
          }
          noStroke();
        }

        // is button
        else {
          noFill();
          stroke('#433E77');
          strokeWeight(3);
        }
        ellipse(0, 0, 30, 30);

        noStroke();
        fill('#ffffff');
        textAlign(CENTER);
        textSize(20);
        text(button, 0, 40);
        pop();
      });

      pop();
    });

    push();
    translate(width / 2 - 25 - 450, height / 2 - 270);
    rectMode(CORNER);

    noStroke();
    fill('#433E77');
    rect(0, 0, 20, 550);

    for (let i = 0; i < 54; i++) {
      if (i < jauge) {
        if (i < 18) {
          fill('#FFFFFF');
        } else if (i < 30) {
          fill('#FFFF00');
        } else if (i < 42) {
          fill('#FF6600');
        } else {
          fill('#FF0000');
        }
      } else {
        fill('#433E77');
      }

      ellipse(10, 540 - i * 10, 8, 8);
    }

    if (jauge >= 42) {
      if (frameCount % 30 < 15) {
        fill('#FF0000');
      }
      rect(0, -50, 20, 50);
    }
    // fill('#FFFFFF');
    // rect(0, 540 - jauge * 10, 50, jauge * 10);

    pop();
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

  if (key == "q") {
    let dev_startButtonsBeingPressed = new Array(24).fill(0);
    dev_startButtonsBeingPressed[activeButtons[0]] = 1;
    dev_startButtonsBeingPressed[activeButtons[1]] = 1;
    arduino_gotButtons(dev_startButtonsBeingPressed.join(''));
  }
  if (key == "s") {
    newRound();
  }
  if (key == "d") {
    jauge = 29;
    checkJauge();
  }
}



function shareWithArduino() {
  let lightStates = new Array(24).fill(0);


  buttons.forEach((button, index) => {
    if (fakeButtons.includes(index)) {
      lightStates[index] = 1;
    }
    else if (activeButtons.includes(index)) {
      lightStates[index] = 2; // 2 = blink
    }
    else {
      lightStates[index] = 0;
    }
  });

  let lightStatesToArduino = lightStates.join('');

  if (ENABLE_ARDUINO) {
    console.log('Light sent', lightStatesToArduino);
    arduino_write("l/" + lightStatesToArduino + "\n");
  }
}

function arduino_gotButtons(buttonsStatesRaw) {
  if (step != STEP_PLAY && step != STEP_WAIT) return;


  // get pressed buttons
  let buttonsStates = buttonsStatesRaw.split('');

  let pressedButtons = [];

  buttonsStates
    .map((state, button) => ({ button, state }))
    .filter(({ state }) => state == true)
    .forEach(({ button }) => { pressedButtons.push(button) });

  debug('Boutons pressés : ' + pressedButtons);
  debug('Boutons actifs : ' + activeButtons);



  if (step == STEP_PLAY) {

    /*
      * Check for false pressed buttons
      */

    /*
        pressedButtons.forEach((pressedButton) => {
          if (!activeButtons.includes(pressedButton)) {
            // is pressing fake button!
            console.log('Mauvais bouton !');
            setJaugeMalus();
            playAudio('negative_feedback');
    
            // store states
            prevButtonsStates = buttonsStates;
    
            // Change round
            endRound();
          }
        });
        */

    /*
     * Check for fake buttons
     */


    fakeButtons.forEach((fakeButton) => {
      if (pressedButtons.includes(fakeButton)) {
        // is pressing fake button!
        console.log('Mauvais bouton !');
        setJaugeMalus();
        playAudio('negative_feedback');

        // store states
        prevButtonsStates = buttonsStates;

        // Change round
        endRound();
      }
    });




    /*
     * Check for active buttons
     */

    let isPressingActiveButton1 = false;
    let isPressingActiveButton2 = false;

    // if first button is being pressed
    if (pressedButtons.includes(activeButtons[0])) {
      isPressingActiveButton1 = true;

      if (prevButtonsStates[activeButtons[0]] == 0) {
        // just pressed it
        playAudio('button_pressed');
        debug('Button ' + activeButtons[0] + ' has just start being pressed');
      } else {
        // was already pressed
        debug('Button ' + activeButtons[0] + ' is pressed');
      }
    }

    // if second button is being pressed
    if (pressedButtons.includes(activeButtons[1])) {
      isPressingActiveButton2 = true;

      if (prevButtonsStates[activeButtons[1]] == 0) {
        // just pressed it
        playAudio('button_pressed');
        debug('Button ' + activeButtons[1] + ' has just start being pressed');
      } else {
        // was already pressed
        debug('Button ' + activeButtons[1] + ' is pressed');
      }
    }

    // if both buttons are being pressed
    if (isPressingActiveButton1 && isPressingActiveButton2) {
      setJaugeBonus();
      playAudio('positive_feedback');
      endRound();
    }
  }


  if (step == STEP_WAIT) {
    /*
         * Check for active buttons
         */
    console.log('startButtons : ' + startButton1 + ' ' + startButton2);
    console.log('pressedButtons : ' + pressedButtons);


    let isPressingStartButton1 = false;
    let isPressingStartButton2 = false;

    // if first button is being pressed
    if (pressedButtons.includes(startButton1)) {
      isPressingStartButton1 = true;

      if (prevButtonsStates[startButton1] == 0) {
        // just pressed it
        playAudio('button_pressed');
        debug('Button ' + startButton1 + ' has just start being pressed');
      } else {
        // was already pressed
        debug('Button ' + startButton1 + ' is pressed');
      }
    }

    // if second button is being pressed
    if (pressedButtons.includes(startButton2)) {
      isPressingStartButton2 = true;

      if (prevButtonsStates[startButton2] == 0) {
        // just pressed it
        playAudio('button_pressed');
        debug('Button ' + startButton2 + ' has just start being pressed');
      } else {
        // was already pressed
        debug('Button ' + startButton2 + ' is pressed');
      }
    }

    // if both buttons are being pressed
    if (isPressingStartButton1 && isPressingStartButton2) {
      playAudio('positive_feedback');
      setStep(STEP_COUNTDOWN);
    }
  }

  // store states
  prevButtonsStates = buttonsStates;
}









function setStep(newStep) {
  step = newStep;
  console.error('Step : ' + step);

  if (newStep == STEP_WAIT) {
    initGame();

    playAudio('wait_loop');

    timerWait = setInterval(function () {
      timerWaitJaugeLevel = Math.round(40 + cos(frameCount / 40) * 10) - 13;

      let timerWaitLeds = new Array(54).fill(0).map((value, index) => {
        if (index > timerWaitJaugeLevel) {
          return 0;
        } else {
          return 1;
        }
      }).join('');

      arduino_write("s/" + timerWaitLeds + "\n");
    }, 100);
  } else {
    stopAudio('wait_loop');
    clearInterval(timerWait);
  }




  if (newStep == STEP_COUNTDOWN) {
    playAudio('countdown');

    const blinkDuration = 320;

    // blink animation for rules
    arduino_write("l/000000000000000000000000\n");

    arduino_write("s/000000000000000000000000000000000000000000000000000000\n");

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 2);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 3);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 4);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 5);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 6);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 7);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 8);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 9);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 10);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 11);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 12);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 13);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 14);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 15);

    setTimeout(function () {
      arduino_write("l/111111111111111111111111\n");
      arduino_write("s/111111111111111111111111111111111111111111111111111111\n");
    }, blinkDuration * 16);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
      arduino_write("s/000000000000000000000000000000000000000000000000000000\n");
    }, blinkDuration * 17);

    setTimeout(function () {
      // version 1 led à la fois

      for (let i = 0; i < 24 * 9; i++) {
        let lightStatesGyro = new Array(24).fill(0);
        let ledIndex = i % 24;

        lightStatesGyro[ledIndex] = 1;

        setTimeout(function () {

          arduino_write("l/" + lightStatesGyro.join('') + "\n");

        }, i * 50);
      }


      setTimeout(function () {
        arduino_write("l/000000000000000000000000\n");
      }, 11000);


      // version 1 face à la fois
      /*
      for (let i = 0; i < 6 * 10; i++) {
        let lightStatesGyro = new Array(24).fill(0);
        let faceIndex = i % 6;

        lightStatesGyro[0 + faceIndex * 4] = 1;
        lightStatesGyro[1 + faceIndex * 4] = 1;
        lightStatesGyro[2 + faceIndex * 4] = 1;
        lightStatesGyro[3 + faceIndex * 4] = 1;

        setTimeout(function () {

          arduino_write("l/" + lightStatesGyro.join('') + "\n");

        }, i * 150);
      }
      */

    }, blinkDuration * 18);

    countdown = 17;

    clearInterval(timerCountdown);
    timerCountdown = setInterval(function () {
      countdown--;

      if (countdown <= 0) {
        setStep(STEP_PLAY);
      }
    }, 1000);
  } else {
    clearInterval(timerCountdown);
    stopAudio('countdown');
  }



  if (newStep == STEP_PLAY) {

    newRound();

    // jauge, accelerating
    clearInterval(timerJaugeTick);
    timerJaugeTick = setInterval(function () {
      jauge += jaugeStep;

      playAudio('tick');

      console.warn('Jauge : ' + jauge + ' (tick)');
      checkJauge();
    }, jaugeSpeed);

    // time
    clearInterval(timerPlay);
    timerPlay = setInterval(function () {
      gameDuration++;
    }, 1000);
  } else {
    clearInterval(timerJaugeTick);
    clearInterval(timerPlay);
  }



  if (newStep == STEP_END) {
    endGame();

    countdownEnd = 10;

    clearInterval(timerCountdownEnd);
    timerCountdownEnd = setInterval(function () {
      countdownEnd--;

      if (countdownEnd <= 0) {
        setStep(STEP_WAIT);
      }
    }, 1000);
  } else {
    clearInterval(timerCountdownEnd);
  }
}

function initGame() {
  jauge = 0;
  jaugeSpeed = jaugeSpeedStart;
  gameDuration = 0;
  durationRound = 0;
  durationRoundMax = 6 * 1000; // 6 secondes



  let buttonPlayers = new Array(24).fill(0);
  buttonPlayers[startButton1] = 2;
  buttonPlayers[startButton2] = 2;

  // switch on players buttons
  arduino_write("l/" + buttonPlayers.join('') + "\n");
  arduino_write("j/0\n");
}





function newRound() {
  console.log('Nouveau round');

  clearFakeButtons();
  setNewActiveButtons();
  setNewFakeButtons();

  shareWithArduino();

  durationRound = 0;

  // start round timer
  clearInterval(timerRound);
  timerRound = setInterval(function () {
    durationRound += intervalTickRound;
    // console.log('Jauge timerRound');
    // checkJauge();

    // players has not triggered the buttons in time
    if (durationRound >= durationRoundMax) {
      tooLate();
    }
  }, intervalTickRound);
}


function endRound() {
  console.log('Fin du round');
  clearInterval(timerRound);

  console.log('Jauge fin du round');
  checkJauge(function () {
    // if we can play another round
    newRound();
  });
}



function clearFakeButtons() {
  fakeButtons = [];
}



function setNewActiveButtons() {

  let activeButton1 = floor(random(buttons.length));

  // éviter que ce soit les mêmes boutons qu'avant
  while (buttons[activeButton1] == true) {
    activeButton1 = floor(random(buttons.length));
  }

  let dashboardActiveButton1 = buttonsToDashboard[activeButton1];

  let potentialButtonsForActiveButton2 = [];

  oppositeDashboardsOfDashboard[dashboardActiveButton1].forEach(dashboard => {
    potentialButtonsForActiveButton2 = potentialButtonsForActiveButton2.concat(dashboards[dashboard]);
  });

  let activeButton2 = potentialButtonsForActiveButton2[floor(random(potentialButtonsForActiveButton2.length))];

  // éviter que ce soit les mêmes boutons qu'avant
  while (buttons[activeButton2] == true) {
    activeButton2 = potentialButtonsForActiveButton2[floor(random(potentialButtonsForActiveButton2.length))];
  }

  buttons = new Array(24).fill(0);
  buttons[activeButton1] = 1;
  buttons[activeButton2] = 1;
  activeButtons = [activeButton1, activeButton2];

  // DEBUG

  // let testButton1 = 12;
  // let testButton2 = 13;

  // buttons[testButton1] = 1;
  // buttons[testButton2] = 1;

  // activeButtons = [testButton1, testButton2];


  if (DEBUG) {
    console.warn('Boutons ' + activeButton1 + ' et ' + activeButton2);
    console.warn('Jauge : ' + jauge);
  }
}



function setNewFakeButtons() {

  let fakeButtonsMinMaxCount = getFakeButtonsMinMaxCount();

  let nbFakeButtons = floor(
    random(
      fakeButtonsMinMaxCount[0],
      fakeButtonsMinMaxCount[1] + 1
    )
  );

  let potentialFakeButtons = [];

  buttons.forEach((button, index) => {
    if (button == 0) {
      potentialFakeButtons.push(index);
    }
  });

  for (let i = 0; i < nbFakeButtons; i++) {
    let fakeButton = potentialFakeButtons[floor(random(potentialFakeButtons.length))];

    // éviter que ce soit les mêmes boutons qu'avant
    while (fakeButtons.includes(fakeButton)) {
      fakeButton = potentialFakeButtons[floor(random(potentialFakeButtons.length))];
    }

    fakeButtons.push(fakeButton);
  }

  if (DEBUG) {
    console.warn('Mauvais boutons : ' + fakeButtons);
  }
}






// players has not triggered the buttons simultaneously in time
function tooLate() {
  console.log('Pas assez rapide pour ce round !');
  setJaugeMalus();
  playAudio('negative_feedback');
  endRound();
}

function setJaugeMalus() {
  jauge += jaugeMalus;
  playAudio('jauge_malus');
}

function setJaugeBonus() {
  jauge -= jaugeBonus;
  playAudio('jauge_bonus');

  // increase jauge speed
  // jaugeSpeed -= 100;
  // jaugeSpeed = max(jaugeSpeed, jaugeSpeedMax);

  // decrease button duration to press them
  durationRoundMax -= 200;
  durationRoundMax = max(durationRoundMax, 1000);

  console.log('jaugeSpeed', jaugeSpeed);
  console.log('durationRoundMax', durationRoundMax);
}


function checkJauge(cb = function () { }) {
  jauge = max(jauge, 0); // on évite le jauge négatif

  if (ENABLE_ARDUINO) {
    console.log('Jauge envoyée à Arduino');
    arduino_write("j/" + jauge + "\n");
  }

  // console.warn('Jauge : ' + jauge);

  if (jauge >= jaugeMax) {
    console.log('La jauge a explosée !');
    setStep(STEP_END);
  } else {
    if (jauge >= 30) {
      playAudio('alarm');
    } else {
      stopAudio('alarm');
    }
    cb();
  }
}

// is called when STEP_END
function endGame() {
  clearInterval(timerJaugeTick);
  clearInterval(timerPlay);
  clearInterval(timerRound);
  stopAudio('alarm');
  playAudio('end');
  playAudio('end_ia');

  console.log('Jauge explosion envoyée à Arduino');
  //arduino_write("j/e\n"); // jauge/end

  // animation jauge end
  for (let i = 0; i < 54; i++) {
    setTimeout(function () {
      arduino_write("e/" + (53 - i) + "\n"); // jauge/end
    }, i * 50);
  }

  const nbBlinks = 30;
  const blinkDuration = 100;

  for (let i = 0; i < nbBlinks; i++) {
    setTimeout(function () {

      let randomLeds = new Array(24).fill(0).map(() => {
        if (Math.random() > 1 - (i / nbBlinks)) {
          return 0;
        } else {
          return 1;
        }
      }).join('');

      arduino_write("l/" + randomLeds + "\n");
    }, i * blinkDuration);

    setTimeout(function () {
      arduino_write("l/000000000000000000000000\n");
    }, nbBlinks * blinkDuration);
  }
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

function debug(message, style = null) {
  if (!DEBUG) return;

  if (style) {
    const colors = {
      'green': 'color: green',
      'blue': 'color: blue',
      'orange': 'color: orange',
      'red': 'color: red',
      'info': 'color: yellow',
    };

    console.log('%c' + message, colors[style]);
  } else {
    console.log(message);
  }
}

function arduino_write(s) {
  if (ENABLE_ARDUINO) {
    port.write(s);
  }
}