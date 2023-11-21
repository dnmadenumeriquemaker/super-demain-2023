let DEBUG = true;
let ENABLE_ARDUINO = false;
let IS_ARDUINO_OK = false;

// Controle viseur : ZQSD,8426, fleches directionelles;
// tir : espace (air),v (bateaux), b (sous l'eau)

let screen = null;

viseurSizeXY = 20

let scoreDif = 0.1
let difficulty = 1;
let score = 0;

let horizon
let avionSpawn
let ligneEau
let sousmarin

let squareX;
let squareSize = 50;
let squareAngle = 0;
let distCrosshair = 0;
let ax, ay, bx, by, cx, cy;
let mx;
let my;
let scoreX;
let scoreY;
let mouseClickX;
let mouseClickY;

let redCircles = [];
let lastRedCircleTime = 0;
let redCircleInterval = 1000; // Intervalle d'apparition des cercles rouges

let whiteCircles = [];
let lastWhiteCircleTime = 10000;
let whiteCircleInterval = 13000; // Intervalle d'apparition des cercles blancs

let yellowCircles = [];
let lastYellowCircleTime = 18000;
let yellowCircleInterval = 13000; // Intervalle d'apparition des cercles jaune

let blueCircles = [];
let lastBlueCircleTime = 24000;
let blueCircleInterval = 13000; // Intervalle d'apparition des cercles bleus

let Bullettype = [1, 2, 3];
let bulletSize;
let clr = 0

// niveau de vitesse des ennemies
let vitesse = [1.5, 1, 0.5];
let Vwhite;
let Vyellow;
let Vblue;

let type = [1, 2, 3];
let vrbw //modificateur de vitesse pour les ronds blancs
let vrby //modificateur de vitesse pour les ronds jaunes
let vrbb //modificateur de vitesse pour les ronds bleus

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

let players = ['green', 'red', 'yellow'];

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
  viseurB = loadImage("viseur_blanc.png")
  viseurV = loadImage("viseur_vert.png")
  viseurJ = loadImage("viseur_jaune.png")
  viseurR = loadImage("viseur_rouge.png")
  boulet = loadImage("boulet_de_canon.png")

  // Préparation des sprites des ennemis
  spritesAvion = [avL, avM, avS];
  spritesBateau = [btL, btM, btS];
  spritesSousMarin = [smL, smM, smS];

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
  squareX = width / 2;
  ax = bx = cx = mx = width / 2;
  ay = by = cy = my = height / 2;

  // Coordonnées du score
  scoreX = 30;
  scoreY = 30;

  // Zones de spawn des ennemis
  horizon = height / 2.45
  avionSpawn = height / 2.55
  ligneEau = height / 1.77
  sousmarin = height / 1.3

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

    // Démarrer la musique
    playAudio('musique');

    if (DEBUG) {
      fill(0)// Tracer les trois lignes horizontales
      line(0, height / 2.5, width, height / 2.5); //ligne d'horizon
      line(0, (height * 2) / 3.5, width, (height * 2) / 3.5); //ligne d'eau
      line(0, 100, width, 100); // ligne d'ou les ennemies aeriens apparaissent, sert juste de repère
    }


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






    text(Bullettype, 10, 70);

    if (score < 40) {
      difficulty = 0.1
    } else {
      difficulty = exp(scoreDif * 0.01)
    }

    // text(difficulty, 50, 50);


    //affichage des scores
    push();
    fill(135, 205, 255);
    textAlign(LEFT);
    textSize(20);
    textStyle(BOLD);
    text("score :", scoreX, scoreY);
    text(score, scoreX + 80, scoreY + 1);
    pop();




    push()
    noFill()
    distCrosshair = dist(mx, my, width / 2, height);

    bulletSize = map(my, 0, 400, 40, 20);



    ////COMMANDES////


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

    my = constrain(my, 0, height);
    mx = constrain(mx, 0, width);
    my = (ay + by + cy) / 3; //moyenne des mouvement des 3 commandes
    mx = (ax + bx + cx) / 3;
    image(viseurB, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
    ax = bx = cx = constrain(mx, 0, width);
    ay = by = cy = constrain(my, 0, height);






    //CANON
    // Carré orienté vers la souris
    let angle = atan2(my - height, mx - squareX);
    squareAngle = angle; // Met à jour l'angle du carré

    push();
    translate(squareX, height);
    rotate(squareAngle); // Utilise l'angle du carré
    fill(255, 0, 0);
    rectMode(CENTER);
    //rect(0, 0, squareSize, squareSize);
    pop();





    //PROJECTILE
    // Lancer un cercle rouge à intervalle régulier


    //FAIRE EN SORTE QUE LE BOULET DE CANON APPARAISSE EN GROS SUR L'ECRAN PUIS DIMINUE EN TAILLE

    if (keyIsDown("32") && millis() - lastRedCircleTime >= redCircleInterval) {
      mouseClickX = mx;
      mouseClickY = my;
      Bullettype = 1; //type 1 =contre les ennemies en l'air
      let redCircle = {
        x: squareX,
        y: height,
        size: bulletSize,
        angle: -squareAngle,
      };
      redCircles.push(redCircle);

      //a remplacer par image boulet de canon

      lastRedCircleTime = millis();
      //jouer le son "tir" a ce moment la
      playAudio('tir');

    }

    //FAIRE EN SORTE QUE LE BOULET DE CANON APPARAISSE EN GROS SUR L'ECRAN PUIS DIMINUE EN TAILLE

    if (keyIsDown("86") && millis() - lastRedCircleTime >= redCircleInterval) {
      mouseClickX = mx;
      mouseClickY = my;
      Bullettype = 2; //type 2 =contre les ennemies sur l'eau
      let redCircle = {
        x: squareX,
        y: height,
        size: bulletSize,
        angle: -squareAngle,
      };
      redCircles.push(redCircle);
      lastRedCircleTime = millis();
      //jouer le son "tir" a ce moment la
      playAudio('tir');
    }

    //FAIRE EN SORTE QUE LE BOULET DE CANON APPARAISSE EN GROS SUR L'ECRAN PUIS DIMINUE EN TAILLE

    if (keyIsDown("66") && millis() - lastRedCircleTime >= redCircleInterval) {
      mouseClickX = mx;
      mouseClickY = my;
      Bullettype = 3; //type 3 =  contre les ennemies sous l'eau
      let redCircle = {
        x: squareX,
        y: height,
        size: bulletSize,
        angle: -squareAngle,
      };
      redCircles.push(redCircle);
      lastRedCircleTime = millis();
      //jouer le son "tir" a ce moment la

      playAudio('tir');
    }


    // Affichage des cercles rouges lancés
    for (let i = redCircles.length - 1; i >= 0; i--) {
      let redCircle = redCircles[i];
      redCircle.y -= 7 * sin(redCircle.angle);
      redCircle.x += 7 * cos(redCircle.angle);
      //redCircle.y -= log(redCircle.size) * 0.5; // Ralentissement de la vitesse
      redCircle.size = bulletSize; //log(redCircle.size)*0.12 ; // Ralentissement du grossissement

      fill(255, 0, 0);
      ellipse(redCircle.x, redCircle.y, redCircle.size, redCircle.size);

      // taille de la hitbox viseur
      if (
        redCircle.x < mouseClickX + 11 && redCircle.x > mouseClickX - 11 && redCircle.y < mouseClickY + 11 && redCircle.y > mouseClickY - 11
      ) {
        redCircles.splice(i, 1);
        // enlève les cercles rouges qui sortent du canvas
      } else if (
        redCircle.y < 0 || redCircle.x < 0 || redCircle.x > width || redCircle.y > height) {
        redCircles.splice(i, 1);




        //COLLISION//
      } else {
        // Vérification de collision entre cercles rouges et blancs (air)
        for (let j = whiteCircles.length - 1; j >= 0; j--) {
          let whiteCircle = whiteCircles[j];
          let d = dist(redCircle.x, redCircle.y, whiteCircle.x, whiteCircle.y);
          if (
            d < redCircle.size / 2 + whiteCircle.size / 2 &&
            mouseClickY + whiteCircle.size / 2 > whiteCircle.y &&
            Bullettype == 1
          ) {
            redCircles.splice(i, 1);
            whiteCircles.splice(j, 1);

            score = score + 1;
            if (score > 40) {
              scoreDif = scoreDif + 0.1
              //jouer le son "explosion"
              playAudio('explosion');
            }
          }
        }
      }


      // Vérification de collision entre cercles rouges et jaunes (eau)
      for (let k = yellowCircles.length - 1; k >= 0; k--) {
        let yellowCircle = yellowCircles[k];
        let d = dist(redCircle.x, redCircle.y, yellowCircle.x, yellowCircle.y);
        if (
          d < redCircle.size / 2 + yellowCircle.size / 2 &&
          mouseClickY + yellowCircle.size / 2 > yellowCircle.y &&
          Bullettype == 2
        ) {
          redCircles.splice(i, 1);
          yellowCircles.splice(k, 1);
          score = score + 1;
          if (score > 40) {
            scoreDif = scoreDif + 0.1
            //jouer le son "explosion"
            playAudio('explosion');
          }
        }
      }


      // Vérification de collision entre cercles rouges et bleus (sous l'eau)
      for (let l = blueCircles.length - 1; l >= 0; l--) {
        let blueCircle = blueCircles[l];
        let d = dist(redCircle.x, redCircle.y, blueCircle.x, blueCircle.y);
        if (
          d < redCircle.size / 2 + blueCircle.size / 2 &&
          mouseClickY + blueCircle.size / 2 > blueCircle.y &&
          Bullettype == 3
        ) {
          redCircles.splice(i, 1);
          blueCircles.splice(l, 1);
          score = score + 1;
          if (score > 40) {
            scoreDif = scoreDif + 0.1
            //jouer le son "explosion"
            playAudio('explosion');
          }
        }
      }
    }






    //GENERATION ennemies//





    //cercle blanc à intervalle régulier

    if (millis() - lastWhiteCircleTime >= whiteCircleInterval - difficulty * 1000) {
      let circle = {
        x: random(50, width - 50), // Position aléatoire sur l'axe horizontal
        y: avionSpawn, // hauteur de spawn
        size: 5,
        sprite: spritesAvion[int(random(0, 3))],
      };
      whiteCircles.push(circle);
      lastWhiteCircleTime = millis();


      // modificateur de vitesse
      vrbw = random(type)
      if (vrbw == 1) {
        Vwhite = 1.1
      } else if (vrbw == 2) {
        Vwhite = 1
      } else if (vrbw == 3) {
        Vwhite = 0.9
      }

    }

    for (let i = whiteCircles.length - 1; i >= 0; i--) {
      let whiteCircle = whiteCircles[i];

      whiteCircle.y -= log(whiteCircle.size) * 0.2 * Vwhite * difficulty; // ralentissement de la vitesse

      whiteCircle.size += log(whiteCircle.size) * 0.1 * Vwhite * difficulty; // ralentissement du grossissement

      fill(255, 255, 255, 120);
      stroke(0);
      image(whiteCircle.sprite, whiteCircle.x, whiteCircle.y, whiteCircle.size, whiteCircle.size);
      ellipse(whiteCircle.x, whiteCircle.y, whiteCircle.size, whiteCircle.size);

      if (dist(mx, my, whiteCircle.x, whiteCircle.y) < viseurSizeXY / 2 + whiteCircle.size / 2) {
        console.log("yes")


        image(viseurV, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
      } else {
        image(viseurB, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
      }

      if (whiteCircle.y < 0) {
        whiteCircles.splice(i, 1);
        setScreen(3);
      }
    }




    // Générer un cercle jaunes à intervalle régulier
    if (
      millis() - lastYellowCircleTime >=
      yellowCircleInterval - difficulty * 1000
    ) {
      let circle = {
        x: random(50, width - 50), // Position aléatoire sur l'axe horizontal
        y: horizon, // Position sur la troisième ligne à 100 pixels de hauteur
        size: 5,
        sprite: spritesBateau[int(random(0, 3))],
      };
      yellowCircles.push(circle);
      lastYellowCircleTime = millis();

      // modificateur de vitesse
      vrby = random(type)
      if (vrby == 1) {
        Vyellow = 1.1
      } else if (vrby == 2) {
        Vyellow = 1
      } else if (vrby == 3) {
        Vyellow = 0.9
      }

    }



    for (let i = yellowCircles.length - 1; i >= 0; i--) {
      let YellowCircle = yellowCircles[i];
      YellowCircle.y += log(YellowCircle.size) * 0.04 * Vyellow * difficulty; // Ralentissement de la vitesse
      YellowCircle.size += log(YellowCircle.size) * 0.2 * Vyellow * difficulty; // Ralentissement du grossissement

      fill(255, 255, 0, 120);
      stroke(0);
      image(YellowCircle.sprite, YellowCircle.x, YellowCircle.y, YellowCircle.size, YellowCircle.size);
      ellipse(YellowCircle.x, YellowCircle.y, YellowCircle.size, YellowCircle.size);

      // VISEUR  ROUGE
      if (dist(mx, my, YellowCircle.x, YellowCircle.y) < viseurSizeXY / 2 + YellowCircle.size / 2) {
        console.log("yes")


        image(viseurR, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
      } else {
        image(viseurB, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
      }

      if (YellowCircle.y > ligneEau) {
        yellowCircles.splice(i, 1);
        setScreen(3);
      }
    }




    // Générer un cercle bleu à intervalle régulier

    if (
      millis() - lastBlueCircleTime >=
      blueCircleInterval - difficulty * 1000
    ) {
      let circle = {
        x: random(50, width - 50), // Position aléatoire sur l'axe horizontal
        y: ligneEau, // Position sur la troisième ligne à 100 pixels de hauteur
        size: 5,
        sprite: spritesSousMarin[int(random(0, 3))],
      };
      blueCircles.push(circle);
      lastBlueCircleTime = millis();
      // Vblue = random(vitesse);
      vrbb = random(type)
      if (vrbb == 1) {
        Vblue = 1.1
      } else if (vrbb == 2) {
        Vblue = 1
      } else if (vrbb == 3) {
        Vblue = 0.9
      }

    }

    for (let i = blueCircles.length - 1; i >= 0; i--) {
      let blueCircle = blueCircles[i];
      blueCircle.y += log(blueCircle.size) * 0.2 * Vblue * difficulty; // Ralentissement de la vitesse
      blueCircle.size += log(blueCircle.size) * 0.1 * Vblue * difficulty; // Ralentissement du grossissement

      fill(0, 0, 255, 120);
      stroke(0);
      image(blueCircle.sprite, blueCircle.x, blueCircle.y, blueCircle.size, blueCircle.size);
      ellipse(blueCircle.x, blueCircle.y, blueCircle.size, blueCircle.size);

      // VISEUR JAUNE
      if (dist(mx, my, blueCircle.x, blueCircle.y) < viseurSizeXY / 2 + blueCircle.size / 2) {
        console.log("yes")


        image(viseurJ, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
      } else {
        image(viseurB, mx, my, viseurSizeXY * 2, viseurSizeXY * 2)
      }

      if (blueCircle.y > sousmarin) {
        blueCircles.splice(i, 1);
        setScreen(3);

      }
    }
    pop()

    // SCREEN 3 DEFAITE//

  } else if (screen == 3) {
    //éteindre la music

    stopAudio('musique');

    push()
    // background(0,0,255)
    push()
    imageMode(CORNER)
    image(gameBackground, 0, 0, width, height) //remplacer par le fond finale
    pop()
    //  background(48, 191, 191);
    fill(255);
    textAlign(CENTER);
    textSize(28);
    text(
      "vous avez perdu.", width / 2, height / 2 - 20);



    if (keyIsDown(32)) {
      push()
      fill(0, 255, 0)
      circle(width / 2 - 100, height / 1.5, 50)
      pop()
      text("prêt", width / 2 - 100, height / 1.5 + 50)
    }

    if (keyIsDown(66)) {
      push()
      fill(255, 0, 0)
      circle(width / 2, height / 1.5, 50)
      pop()
      text("prêt", width / 2, height / 1.5 + 50)
    }
    if (keyIsDown(86)) {
      push()
      fill(255, 255, 0)
      circle(width / 2 + 100, height / 1.5, 50)
      pop()
      text("prêt", width / 2 + 100, height / 1.5 + 50)
    }


    if (keyIsDown(32) && keyIsDown(66) && keyIsDown(86) && !allButtonsArePressed) {
      location.reload();
      allButtonsArePressed = true
    }
    pop()
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
    let playerColor = players[index];

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