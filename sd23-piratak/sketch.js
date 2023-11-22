let DEBUG = true;
let ENABLE_ARDUINO = false;
let IS_ARDUINO_OK = false;

// Controle viseur : ZQSD,8426, fleches directionelles;
// tir : espace (air),v (bateaux), b (sous l'eau)

// Pas d'écran au lancement du dispositif
// pour attente que Arduino soit bien connecté
let screen = null;

let canonX;
let canonSize = 50;

let viseurAngle = 0;
let viseurSize = 20;
let ax, ay, bx, by, cx, cy;

let viseurX;
let viseurY;

let scoreX;
let scoreY;

let viseurImage;
let viseurs = {};


// Valeurs initialisées à chaque partie
// dans la fonction initGame()
let score;

let enemies = [];
let lastEnemyGeneratedTime;
let timeBetweenTwoEnemies;
let enemyLifespan;

let bullets = [];
let lastBulletTime;
let timeBetweenTwoBullets;
let canShootBullet;

let nextEnemyToGenerate;

// - - - - - - -

let enemiesConfig = {
  green: {
    yStart: 260,
    yEnd: 150,

    sizeStart: 5,
    sizeEnd: 200,
  },
  red: {
    yStart: 290,
    yEnd: 310,

    sizeStart: 2,
    sizeEnd: 200,
  },
  yellow: {
    yStart: 415,
    yEnd: 580,

    sizeStart: 5,
    sizeEnd: 250,
  }
}

let bulletType = [1, 2, 3];
let bulletSize = 40;

let type = [1, 2, 3];

let allButtonsArePressed = false

let spritesAvion = [];
let spritesBateau = [];
let spritesSousMarin = [];

let audios = [];
let CAN_AUDIO = false;

const audiosList = [
  'explosion',
  'tir',
  'musique',
];

let colors = ['green', 'red', 'yellow'];

let controllers = {
  red: {
    joystick: {
      up: 0,
      right: 0,
      down: 0,
      left: 0,
    },
    button: 0
  },
  green: {
    joystick: {
      up: 0,
      right: 0,
      down: 0,
      left: 0,
    },
    button: 0
  },
  yellow: {
    joystick: {
      up: 0,
      right: 0,
      down: 0,
      left: 0,
    },
    button: 0
  }
};

let layerGameBackground;

function preload() {
  // song = loadSound("");
  // explosion = loadSound ("explosion.mp3")
  // tir = loadSound("tir.mp3")
  gameBackground = loadImage("fond.png")//images temporaires 
  viseur = loadImage("viseur.png")
  avL = loadImage("avion L.png")
  avM = loadImage("avion M.png")
  avS = loadImage("avion S.png")
  btL = loadImage("bateau L.png")
  btM = loadImage("bateau M.png")
  btS = loadImage("bateau S.png")
  smL = loadImage("SousMarin L.png")
  smM = loadImage("SousMarin M.png")
  smS = loadImage("SousMarin S.png")
  txt0 = loadImage("mechano.png")
  txtWaitScreen = loadImage("mechano.png")
  txtInstructions = loadImage("mechano.png")
  feedbackButtonOK = loadImage("mechano.png")
  txt2 = loadImage("fond.png")

  viseurNeutral = loadImage("viseur_blanc.png")
  viseurs.green = loadImage("viseur_vert.png")
  viseurs.red = loadImage("viseur_rouge.png")
  viseurs.yellow = loadImage("viseur_jaune.png")

  boulet = loadImage("boulet_de_canon.png")

  // Préparation des sprites des ennemis
  spritesAvion = [avL, avM, avS];
  spritesBateau = [btL, btM, btS];
  spritesSousMarin = [smL, smM, smS];

  enemiesConfig.green.sprites = [avL, avM, avS];
  enemiesConfig.red.sprites = [btL, btM, btS];
  enemiesConfig.yellow.sprites = [smL, smM, smS];

  // Chargement de tous les sons
  audiosList.forEach(audioName => {
    audios[audioName] = document.getElementById(audioName);
  });
}

function setup() {
  createCanvas(1280, 720);

  layerGameBackground = createGraphics(width, height);
  layerGameBackground.noStroke();
  layerGameBackground.image(gameBackground, 0, 0, width, height);

  // Canon et viseur
  canonX = width / 2;
  ax = bx = cx = viseurX = width / 2;
  ay = by = cy = viseurY = height / 2;

  // Coordonnées du score
  scoreX = 30;
  scoreY = 30;

  // Initier la communication avec Arduino
  if (ENABLE_ARDUINO) {
    port = createSerial();

    let usedPorts = usedSerialPorts();
    if (usedPorts.length > 0) {
      port.open(usedPorts[0], 9600);
    }
  }
}


function draw() {


  if (DEBUG) {
    // Debug: simuler Arduino avec le clavier
    controllers['green'].button = keyIsDown(32);
    controllers['red'].button = keyIsDown(66);
    controllers['yellow'].button = keyIsDown(86);

    controllers['green'].joystick.up = keyIsDown(UP_ARROW);
    controllers['green'].joystick.right = keyIsDown(RIGHT_ARROW);
    controllers['green'].joystick.down = keyIsDown(DOWN_ARROW);
    controllers['green'].joystick.left = keyIsDown(LEFT_ARROW);

    controllers['red'].joystick.up = keyIsDown(104);
    controllers['red'].joystick.right = keyIsDown(102);
    controllers['red'].joystick.down = keyIsDown(98);
    controllers['red'].joystick.left = keyIsDown(100);

    controllers['yellow'].joystick.up = keyIsDown(90);
    controllers['yellow'].joystick.right = keyIsDown(68);
    controllers['yellow'].joystick.down = keyIsDown(83);
    controllers['yellow'].joystick.left = keyIsDown(81);
  }


  if (screen == null) {
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
        text("Arduino détectée\r\nCliquez n'importe où ou presser\r\nune touche de clavier pour démarrer le dispositif", width / 2, height / 2);
      }
    }
    else {
      textSize(40);
      fill(255);
      text("Cliquez n'importe où ou presser\r\nune touche de clavier pour démarrer le dispositif", width / 2, height / 2);
    }

    pop();
    if ((!ENABLE_ARDUINO && (mouseIsPressed || keyIsPressed))
      || (ENABLE_ARDUINO && IS_ARDUINO_OK)) {
      setScreen(0);
    }


    if (ENABLE_ARDUINO) {
      if (!port.opened()) {
        IS_ARDUINO_OK = false;
        console.log('Waiting for Arduino');
      } else {
        IS_ARDUINO_OK = true;
        console.log('Connected');
      }
    }

    // Permet d'autoriser le son lorsque le dispositif est lancé
    if (mouseIsPressed && !CAN_AUDIO) {
      CAN_AUDIO = true;
    }

    return;
  }

  imageMode(CENTER)

  // Si tous les boutons ne sont pas pressés en même temps
  if (playerButtonIsNotPressed('red')
    || playerButtonIsNotPressed('green')
    || playerButtonIsNotPressed('yellow')) {
    allButtonsArePressed = false;
  }

  // updateControllers('00000/00110/01101');

  // Fond du jeu
  push()
  imageMode(CORNER);
  image(layerGameBackground, 0, 0);
  pop();


  /**
   * SCREEN 0
   * Attente 
   * */

  push()

  if (screen == 0) {
    push()
    pop()
    // background(48, 191, 191);
    //imgfond(width/2,height/2)
    fill(255);
    noStroke()
    image(txtWaitScreen, width / 2, height / 2, width - 200, height - 200)

    initGame();


    // Feedback du bouton pressé pour le joueur vert
    if (playerButtonIsPressed('green')) {
      push()
      fill(0, 255, 0)
      circle(width / 2 - 100, height / 1.5, 50)
      pop()
      text("prêt", width / 2 - 100, height / 1.5 + 50)
      image(feedbackButtonOK, width / 2 - 100, height / 1.5 + 40, 50, 20)
    }

    // Feedback du bouton pressé pour le joueur rouge
    if (playerButtonIsPressed('red')) {
      push()
      fill(255, 0, 0)
      circle(width / 2, height / 1.5, 50)
      pop()
      text("prêt", width / 2, height / 1.5 + 50)
      image(feedbackButtonOK, width / 2, height / 1.5 + 40, 50, 20)
    }

    // Feedback du bouton pressé pour le joueur jaune
    if (playerButtonIsPressed('yellow')) {
      push()
      fill(255, 255, 0)
      circle(width / 2 + 100, height / 1.5, 50)
      pop()
      text("prêt", width / 2 + 100, height / 1.5 + 50)
      image(feedbackButtonOK, width / 2 + 100, height / 1.5 + 40, 50, 20)
    }

    // Si tout le monde presse les boutons en même temps
    if (playerButtonIsPressed('green')
      && playerButtonIsPressed('red')
      && playerButtonIsPressed('yellow')
      && !allButtonsArePressed) {
      setScreen(1);
      allButtonsArePressed = true
    }
  }


  /**
   * SCREEN 1
   * Instructions 
   * */

  else if (screen == 1) {
    image(txtInstructions, width / 2, height / 2 - 10, 400, 200)

    /*
     Coordonnez-vous bien pour le diriger
     Appuyez sur vos bouton en même temps pour continuer
     */


    // Feedback du bouton pressé pour le joueur vert
    if (playerButtonIsPressed('green')) {
      push()
      fill(0, 255, 0)
      circle(width / 2 - 100, height / 1.5, 50)
      pop()
      text("prêt", width / 2 - 100, height / 1.5 + 50)
      image(feedbackButtonOK, width / 2 - 100, height / 1.5 + 40, 50, 20)
    }

    // Feedback du bouton pressé pour le joueur rouge
    if (playerButtonIsPressed('red')) {
      push()
      fill(255, 0, 0)
      circle(width / 2, height / 1.5, 50)
      pop()
      text("prêt", width / 2, height / 1.5 + 50)
      image(feedbackButtonOK, width / 2, height / 1.5 + 40, 50, 20)
    }

    // Feedback du bouton pressé pour le joueur jaune
    if (playerButtonIsPressed('yellow')) {
      push()
      fill(255, 255, 0)
      circle(width / 2 + 100, height / 1.5, 50)
      pop()
      text("prêt", width / 2 + 100, height / 1.5 + 50)
      image(feedbackButtonOK, width / 2 + 100, height / 1.5 + 40, 50, 20)
    }


    // Si tout le monde presse les boutons en même temps
    if (playerButtonIsPressed('green')
      && playerButtonIsPressed('red')
      && playerButtonIsPressed('yellow')
      && !allButtonsArePressed) {
      setScreen(2);
      allButtonsArePressed = true
    }
  }


  /**
   * SCREEN 2
   * Jeu 
   * */


  else if (screen == 2) {

    viseurImage = viseurNeutral;

    // Démarrer la musique
    playAudio('musique');

    if (DEBUG) {
      fill(0)// Tracer les trois lignes horizontales
      line(0, height / 2.5, width, height / 2.5); //ligne d'horizon
      line(0, (height * 2) / 3.5, width, (height * 2) / 3.5); //ligne d'eau
      line(0, 100, width, 100); // ligne d'ou les ennemies aeriens apparaissent, sert juste de repère
    }


    /*
    if (millis() < 12000) {
      push()
      fill(255);
      noStroke()
      textAlign(CENTER);
      textSize(28);
      push()
      fill(0, 255, 0, 150)
      rectMode(CORNER)
      rect(0, 0, width, horizon)
      pop()
      text("joueur vert, tirez sur les enemies de la zone verte !", width / 2, height / 4.5)
      pop()
      push()
      fill(255, 0, 0, 170)
      rectMode(CORNER)
      rect(0, horizon, width, ligneEau)
      pop()
      text("joueur rouge, tirez sur les enemies de la zone rouge !", width / 2, height / 2)

      push()
      fill(255, 255, 0, 180)
      rectMode(CORNER)
      rect(0, ligneEau, width, height + 20)
      pop()
      text("joueur jaune, tirez sur les enemies de la zone jaune !", width / 2, height / 1.25)

      pop()
    }
    */



    updateViseur();
    updateCanon();






    // Tir de boulet de canon !

    if ((playerButtonIsPressed('green')
      || playerButtonIsPressed('red')
      || playerButtonIsPressed('yellow'))
      && canShootBullet) {
      canShootBullet = false;

      if (playerButtonIsPressed('green')) {
        bulletType = 'green'; // contre les ennemis en l'air
      }

      if (playerButtonIsPressed('red')) {
        bulletType = 'red'; // contre les ennemis sur l'eau
      }

      if (playerButtonIsPressed('yellow')) {
        bulletType = 'yellow'; // contre les ennemis sous l'eau
      }

      // S'il y a assez de temps entre le précédent tir et ce tir
      if (millis() - lastBulletTime >= timeBetweenTwoBullets || !lastBulletTime) {

        let bulletAngle = - atan2(viseurY - height, viseurX - width / 2);

        // On crée le boulet de canon
        let bullet = {
          x: width / 2,
          y: height,
          xEnd: viseurX,
          yEnd: viseurY,
          size: bulletSize,
          angle: bulletAngle,
          type: bulletType,
        };

        // On l'ajoute aux boulets de canon
        bullets.push(bullet);

        // On réinitialise le délai avec le prochain tir
        lastBulletTime = millis();

        playAudio('tir');
      }
    }

    // Antiflood du shoot
    // (éviter de pouvoir rester appuyé sur un bouton pour tirer en continu)
    if (playerButtonIsNotPressed('green')
      && playerButtonIsNotPressed('red')
      && playerButtonIsNotPressed('yellow')) {
      canShootBullet = true;
    }





    // Générer un ennemi régulièrement

    if (millis() - lastEnemyGeneratedTime >= timeBetweenTwoEnemies || !lastEnemyGeneratedTime) {
      newEnemy();

      lastEnemyGeneratedTime = millis();
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      let enemyConfig = enemiesConfig[enemy.type];

      let elapsedTime = millis() - enemy.startTime;

      // Si l'animation est en cours (durée non dépassée)
      if (elapsedTime < enemy.lifespan) {
        // Calcul de la progression en utilisant une fonction d'interpolation
        // let progression = perspectiveAcceleration(map(elapsedTime, 0, enemy.lifespan, 0, 1));
        let progression = map(elapsedTime, 0, enemy.lifespan, 0, 1);

        enemy.y = lerp(enemyConfig.yStart, enemyConfig.yEnd, progression);
        enemy.size = lerp(enemyConfig.sizeStart, enemyConfig.sizeEnd, progression);

        image(enemy.sprite, enemy.x, enemy.y, enemy.size, enemy.size);

        if (DEBUG) {
          fill(255, 255, 0, 120);
          stroke(0);
          ellipse(enemy.x, enemy.y, enemy.size, enemy.size);
        }

      } else {
        // Partie perdue
        // enemies.splice(i, 1);
        hasLost();
      }

      if (dist(viseurX, viseurY, enemy.x, enemy.y) < viseurSize / 2 + enemy.size / 2) {

        viseurImage = viseurs[enemy.type];

        // TODO BONUS: Arduino: éclairer le bouton à presser 
        // (attention à l'envoi flood de données, on est dans draw)
      }
    }



    // Affichage des boulets de canon lancés
    for (let i = bullets.length - 1; i >= 0; i--) {
      let bullet = bullets[i];

      moveBulletAndCheckCollisions(bullet);

      if (bullet.dead) {
        bullets.splice(i, 1);
        continue;
      }

      displayBullet(bullet);
    }

    pop()

    displayCanon();
    displayViseur();
    displayScore();
  }

  /**
   * SCREEN 3
   * Défaite
   */

  else if (screen == 3) {
    stopAudio('musique');

    fill(255);
    textAlign(CENTER);
    textSize(28);
    text(
      "vous avez perdu.", width / 2, height / 2 - 20);

    setTimeout(function(){
      setScreen(0);
    }, 15000); // Temps de l'écran de défaite
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

function setScreen(newScreen) {
  screen = newScreen;
}

function updateControllers(data) {

  let controllersPlayers = data.split('/');

  controllersPlayers.forEach((controllerPlayer, index) => {
    let controller = controllersPlayers[index].split('');
    let playerColor = colors[index];

    controllers[playerColor].joystick.up = int(controller[0]);
    controllers[playerColor].joystick.right = int(controller[1]);
    controllers[playerColor].joystick.down = int(controller[2]);
    controllers[playerColor].joystick.left = int(controller[3]);
    controllers[playerColor].button = int(controller[4]);
  });
}

function playerButtonIsPressed(playerColor) {
  return controllers[playerColor].button == 1;
}

function playerButtonIsNotPressed(playerColor) {
  return controllers[playerColor].button == 0;
}


function playerUpIsTriggered(playerColor) {
  return controllers[playerColor].joystick.up == 1;
}

function playerRightIsTriggered(playerColor) {
  return controllers[playerColor].joystick.right == 1;
}

function playerDownIsTriggered(playerColor) {
  return controllers[playerColor].joystick.down == 1;
}

function playerLeftIsTriggered(playerColor) {
  return controllers[playerColor].joystick.left == 1;
}

// function perspectiveAcceleration(x) {
//   return -(Math.cos(Math.PI * x) - 1) / 2;
// }

function updateViseur() {
  // Orienter le viseur

  if (playerUpIsTriggered('green')) {
    ay -= 4;
  }
  if (playerRightIsTriggered('green')) {
    ax += 4;
  }
  if (playerDownIsTriggered('green')) {
    ay += 4;
  }
  if (playerLeftIsTriggered('green')) {
    ax -= 4;
  }

  if (playerUpIsTriggered('red')) {
    by -= 4;
  }
  if (playerRightIsTriggered('red')) {
    bx += 4;
  }
  if (playerDownIsTriggered('red')) {
    by += 4;
  }
  if (playerLeftIsTriggered('red')) {
    bx -= 4;
  }

  if (playerUpIsTriggered('yellow')) {
    cy -= 4;
  }
  if (playerRightIsTriggered('yellow')) {
    cx += 4;
  }
  if (playerDownIsTriggered('yellow')) {
    cy += 4;
  }
  if (playerLeftIsTriggered('yellow')) {
    cx -= 4;
  }
}

function displayViseur() {

  viseurY = constrain(viseurY, 0, height);
  viseurX = constrain(viseurX, 0, width);

  viseurY = (ay + by + cy) / 3; // moyenne des mouvement des 3 commandes
  viseurX = (ax + bx + cx) / 3;

  push()
  imageMode(CENTER)
  image(viseurImage, viseurX, viseurY, viseurSize * 2, viseurSize * 2)
  pop()

  ax = bx = cx = constrain(viseurX, 0, width);
  ay = by = cy = constrain(viseurY, 0, height);
}

function newEnemy(color = null) {
  let enemyColor = color;

  if (!enemyColor) {
    nextEnemyToGenerate = (nextEnemyToGenerate + 1) % colors.length;
    enemyColor = colors[nextEnemyToGenerate];
  }

  let enemy = {
    type: enemyColor,
    x: random(50, width - 50), // Position aléatoire sur l'axe horizontal
    sprite: enemiesConfig[enemyColor].sprites[int(random(0, enemiesConfig[enemyColor].sprites.length))],

    startTime: millis(),
    lifespan: enemyLifespan,
  };

  enemies.push(enemy);
}

function initGame() {
  score = 0;

  enemies = [];
  enemyLifespan = 20000; // Durée de vie des ennemis
  timeBetweenTwoEnemies = 10000; // Temps entre deux ennemis
  lastEnemyGeneratedTime = 0;

  bullets = [];
  timeBetweenTwoBullets = 1000; // Temps entre deux boulets de canon
  lastBulletTime = false;
  canShootBullet = true;

  nextEnemyToGenerate = floor(random(0, colors.length));
}

function hasScored() {
  score += 1;

  playAudio('explosion');

  // Force la génération du prochain ennemi (évite les temps morts)
  lastEnemyGeneratedTime = false;

  // Augmenter la difficulté
  if (score >= 4) {
    // TODO: calibration de la difficulté
    timeBetweenTwoEnemies = max(5000 - (score * 500), 3000); // Les ennemis arrivent plus vite
    enemyLifespan = max(20000 - (score * 1000), 5000); // Les ennemis vont plus vite
  }
}

function hasLost() {
  setScreen(3);
}

function moveBulletAndCheckCollisions(bullet) {
  bullet.x += 7 * cos(bullet.angle);
  bullet.y -= 7 * sin(bullet.angle);
  bullet.size = bulletSize;

  // Si le boulet de canon arrive en bout de trajet
  // et n'a rencontré aucun ennemi, on le supprime
  if (
    bullet.x < bullet.xEnd + bullet.size / 2
    && bullet.x > bullet.xEnd - bullet.size / 2
    && bullet.y < bullet.yEnd + bullet.size / 2
    && bullet.y > bullet.yEnd - bullet.size / 2
  ) {
    bullet.dead = true;
    return;
  }


  // Si le boulet de canon est hors-champ,
  // on le supprime
  else if (
    bullet.y < 0
    || bullet.x < 0
    || bullet.x > width
    || bullet.y > height) {
    bullet.dead = true;
    return;
  }


  else {
    // On vérifie les collisions entre les boulets de canon et les  ennemis
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];

      // Si ça n'est pas la bonne combinaison de couleur, on passe
      if (enemy.type != bullet.type) continue;

      // On calcule la distance entre le boulet de canon et l'ennemi
      let d = dist(bullet.x, bullet.y, enemy.x, enemy.y);

      // Si la distance est inférieure à la somme des rayons
      if (d < bullet.size / 2 + enemy.size / 2) {
        bullet.dead = true;
        enemies.splice(j, 1);

        hasScored();
      }
    }
  }
}

function displayBullet(bullet) {
  fill(255, 0, 255);
  ellipse(bullet.x, bullet.y, bullet.size, bullet.size);
}

function updateCanon() {
  viseurAngle = atan2(viseurY - height, viseurX - width / 2); // Met à jour l'angle du carré
}

function displayCanon() {
  push();
  translate(canonX, height);
  rotate(viseurAngle); // Utilise l'angle du carré
  fill(255, 0, 0);
  rectMode(CENTER);
  rect(0, 0, canonSize, canonSize);
  pop();
}

function displayScore() {
  // Affichage du score
  // TODO: à améliorer
  push();
  fill(135, 205, 255);
  textAlign(LEFT);
  textSize(20);
  textStyle(BOLD);
  text("score :", scoreX, scoreY);
  text(score, scoreX + 80, scoreY + 1);
  pop();
}