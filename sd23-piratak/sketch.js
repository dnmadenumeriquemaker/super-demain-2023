// Controle viseur : ZQSD,8426, fleches directionelles;
// tir : espace (air),v (bateaux), b (sous l'eau)

let screen = 0;

let scoreDif = 0.1
let difficulty = 1;
let score = 0;


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


// niveau de vitesse des ennemies
let vitesse = [1.5, 1, 0.5];
let Vwhite;
let Vyellow;
let Vblue;

let type = [1, 2, 3];
let vrbw //modificateur de vitesse pour les ronds blancs
let vrby //modificateur de vitesse pour les ronds jaunes
let vrbb //modificateur de vitesse pour les ronds bleus

let playerClic = false

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

function preload() {
  // song = loadSound("");
  // explosion = loadSound ("explosion.mp3")
  // tir = loadSound("tir.mp3")
  imgTest = loadImage("mechano.png")//images temporaires 
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
  //imgfond = loadImage("") // fond

  spritesAvion = [avL, avM, avS];
  spritesBateau = [btL, btM, btS];
  spritesSousMarin = [smL, smM, smS];

  audiosList.forEach(audioName => {
    audios[audioName] = document.getElementById(audioName);
  });
}

function setup() {
  createCanvas(1280, 768);
  squareX = width / 2;
  ax = bx = cx = mx = width / 2;
  ay = by = cy = my = height / 2;

  scoreX = 30; //coordonnées affichage score
  scoreY = 30;
}


function draw() {

  if (mouseIsPressed && !CAN_AUDIO) {
    CAN_AUDIO = true;
  }

  imageMode(CENTER)

  if (!keyIsDown(32) || !keyIsDown(66) || !keyIsDown(86)) {
    playerClic = false;
  }



  // SCREEN 0 (MENU) //


  push()
  if (screen == 0) {
    push()
    imageMode(CORNER)
    image(imgTest, 0, 0, width, height) //remplacer par le fond final
    pop()
    // background(48, 191, 191);
    //imgfond(width/2,height/2)
    fill(255);
    noStroke()
    textAlign(CENTER);
    textSize(28);
    text(
      "Appuyez sur vos bouton en même pour continuer.",
      width / 2,
      height / 2 - 20
    );

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


    if (keyIsDown(32) && keyIsDown(66) && keyIsDown(86) && !playerClic) {
      screen = 1;
      playerClic = true
    }



    // SCREEN 1 (instructions) //


  } else if (screen == 1) {
    // background(0,255,0)
    push()
    imageMode(CORNER)
    image(imgTest, 0, 0, width, height) //remplacer par le fond finale
    pop()
    text("Vous contrôler tous le viseur!", width / 2, height / 2 - 50);
    text("Coordonnez vous bien pour le diriger.", width / 2, height / 2 - 20)
    text("Appuyez sur vos bouton en même pour continuer.", width / 2, height / 2 + 30);
    if (keyIsDown(32) && keyIsDown(66) && keyIsDown(86) && !playerClic) {
      screen = 2;
      playerClic = true
    }
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
    pop()



    // SCREEN 2  //
    //CODE DU JEU//


  } else if (screen == 2) {


    // Démarrer la music
    playAudio('musique');

    push()
    imageMode(CORNER)
    image(imgTest, 0, 0, width, height) //remplacer par le fond finale
    pop()
    // fill(0)// Tracer les trois lignes horizontales
    // line(0, height / 2.5, width, height / 2.5); //ligne d'horizon
    // line(0, (height * 2) / 3.5, width, (height * 2) / 3.5); //ligne d'eau
    // line(0, 100, width, 100); // ligne d'ou les ennemies aeriens apparaissent, sert juste de repère


    if (millis() < 5000) {
      push()
      fill(255);
      noStroke()
      textAlign(CENTER);
      textSize(28);
      push()
      fill(0, 255, 0, 100)
      rectMode(CORNER)
      rect(0, 0, width, height / 2.5)
      pop()
      text("joueur vert, tirez sur les enemies de la zone verte !", width / 2, height / 4.5)
      pop()
      push()
      fill(255, 0, 0, 100)
      rectMode(CORNER)
      rect(0, height / 2.5, width, height / 5.8333)
      pop()
      text("joueur jaune, tirez sur les enemies de la zone jaune !", width / 2, height / 2)

      push()
      fill(255, 255, 0, 100)
      rectMode(CORNER)
      rect(0, (height * 2) / 3.5, width, height)
      pop()
      text("joueur rouge, tirez sur les enemies de la zone rouge !", width / 2, height / 1.25)

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

    bulletSize = map(my, 0, 400, 50, 10);
    //COMMANDES//
    if (keyIsDown(UP_ARROW)) {
      ay -= 4;
    }
    if (keyIsDown(DOWN_ARROW)) {
      ay += 4;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      ax += 4;
    }
    if (keyIsDown(LEFT_ARROW)) {
      ax -= 4;
    }

    if (keyIsDown("104")) {
      by -= 4;
    }
    if (keyIsDown("98")) {
      by += 4;
    }
    if (keyIsDown("102")) {
      bx += 4;
    }
    if (keyIsDown("100")) {
      bx -= 4;
    }

    if (keyIsDown("90")) {
      cy -= 4;
    }
    if (keyIsDown("83")) {
      cy += 4;
    }
    if (keyIsDown("68")) {
      cx += 4;
    }
    if (keyIsDown("81")) {
      cx -= 4;
    }

    my = constrain(my, 0, height);
    mx = constrain(mx, 0, width);
    my = (ay + by + cy) / 3; //moyenne des mouvement des 3 commandes
    mx = (ax + bx + cx) / 3;
    fill(0);
    ellipse(mx, my, 10, 10);
    image(viseur, mx, my, 40, 40)
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
    rect(0, 0, squareSize, squareSize);
    pop();





    //PROJECTILE
    // Lancer un cercle rouge à intervalle régulier

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
      lastRedCircleTime = millis();
      //jouer le son "tir" a ce moment la
      playAudio('tir');

    }
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
        redCircle.x < mouseClickX + 10 && redCircle.x > mouseClickX - 10 && redCircle.y < mouseClickY + 10 && redCircle.y > mouseClickY - 10
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
        y: height / 2.5, // hauteur de spawn
        size: 3,
        sprite: spritesAvion[int(random(0, 3))],
      };
      whiteCircles.push(circle);
      lastWhiteCircleTime = millis();


      // modificateur de vitesse
      vrbw = random(type)
      if (vrbw == 1) {
        Vwhite = 1.3
      } else if (vrbw == 2) {
        Vwhite = 0.9
      } else if (vrbw == 3) {
        Vwhite = 0.3
      }

    }

    for (let i = whiteCircles.length - 1; i >= 0; i--) {
      let whiteCircle = whiteCircles[i];

      whiteCircle.y -= log(whiteCircle.size) * 0.009 * Vwhite * difficulty; // ralentissement de la vitesse

      whiteCircle.size += log(whiteCircle.size) * 0.5 * Vwhite * difficulty; // ralentissement du grossissement

      fill(255);
      stroke(0);
      image(whiteCircle.sprite, whiteCircle.x, whiteCircle.y, whiteCircle.size, whiteCircle.size);
      // ellipse(whiteCircle.x, whiteCircle.y, whiteCircle.size, whiteCircle.size);


      if (whiteCircle.y < 0) {
        whiteCircles.splice(i, 1);
        screen = 3
      }
    }




    // Générer un cercle jaunes à intervalle régulier
    if (
      millis() - lastYellowCircleTime >=
      yellowCircleInterval - difficulty * 1000
    ) {
      let circle = {
        x: random(50, width - 50), // Position aléatoire sur l'axe horizontal
        y: height / 2.5, // Position sur la troisième ligne à 100 pixels de hauteur
        size: 3,
        sprite: spritesBateau[int(random(0, 3))],
      };
      yellowCircles.push(circle);
      lastYellowCircleTime = millis();

      // modificateur de vitesse
      vrby = random(type)
      if (vrby == 1) {
        Vyellow = 1.2
      } else if (vrby == 2) {
        Vyellow = 0.9
      } else if (vrby == 3) {
        Vyellow = 0.3
      }

    }



    for (let i = yellowCircles.length - 1; i >= 0; i--) {
      let YellowCircle = yellowCircles[i];
      YellowCircle.y += log(YellowCircle.size) * 0.007 * Vyellow * difficulty; // Ralentissement de la vitesse
      YellowCircle.size += log(YellowCircle.size) * 0.01 * Vyellow * difficulty; // Ralentissement du grossissement

      fill(255, 255, 0);
      stroke(0);
      image(YellowCircle.sprite, YellowCircle.x, YellowCircle.y, YellowCircle.size, YellowCircle.size);
      // ellipse(YellowCircle.x, YellowCircle.y, YellowCircle.size, YellowCircle.size);



      if (YellowCircle.y > (height * 2) / 3.5) {
        yellowCircles.splice(i, 1);
        screen = 3
      }
    }




    // Générer un cercle bleu à intervalle régulier

    if (
      millis() - lastBlueCircleTime >=
      blueCircleInterval - difficulty * 1000
    ) {
      let circle = {
        x: random(50, width - 50), // Position aléatoire sur l'axe horizontal
        y: (height * 2) / 3.5, // Position sur la troisième ligne à 100 pixels de hauteur
        size: 3,
        sprite: spritesSousMarin[int(random(0, 3))],
      };
      blueCircles.push(circle);
      lastBlueCircleTime = millis();
      // Vblue = random(vitesse);
      vrbb = random(type)
      if (vrbb == 1) {
        Vblue = 1.3
      } else if (vrbb == 2) {
        Vblue = 0.1
      } else if (vrbb == 3) {
        Vblue = 0.4
      }

    }

    for (let i = blueCircles.length - 1; i >= 0; i--) {
      let blueCircle = blueCircles[i];
      blueCircle.y += log(blueCircle.size) * 0.009 * Vblue * difficulty; // Ralentissement de la vitesse
      blueCircle.size += log(blueCircle.size) * 0.005 * Vblue * difficulty; // Ralentissement du grossissement

      fill(0, 0, 255);
      stroke(0);
      image(blueCircle.sprite, blueCircle.x, blueCircle.y, blueCircle.size, blueCircle.size);
      // ellipse(blueCircle.x, blueCircle.y, blueCircle.size, blueCircle.size);

      if (blueCircle.y > height - 70) {
        blueCircles.splice(i, 1);
        screen = 3

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
    image(imgTest, 0, 0, width, height) //remplacer par le fond finale
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


    if (keyIsDown(32) && keyIsDown(66) && keyIsDown(86) && !playerClic) {
      location.reload();
      playerClic = true
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