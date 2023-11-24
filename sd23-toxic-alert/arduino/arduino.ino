


const int boutonPin1 = 6;
const int ledPin1 = 7;

const int boutonPin2 = 4;
const int ledPin2 = 5;

const int boutonPin3 = 2;
const int ledPin3 = 3;

const int boutonPin4 = 8;
const int ledPin4 = 9;



const int boutonPin5 = 12;
const int ledPin5 = 13;

const int boutonPin6 = 24;
const int ledPin6 = 25;

const int boutonPin7 = 22;
const int ledPin7 = 23;

const int boutonPin8 = 10;
const int ledPin8 = 11;




const int boutonPin9 = 28;
const int ledPin9 = 29;

const int boutonPin10 = 30;
const int ledPin10 = 31;

const int boutonPin11 = 32;
const int ledPin11 = 33;

const int boutonPin12 = 26;
const int ledPin12 = 27;





const int boutonPin13 = 34;
const int ledPin13 = 35;

const int boutonPin14 = 36;
const int ledPin14 = 37;

const int boutonPin15 = 40;
const int ledPin15 = 41;

const int boutonPin16 = 38;
const int ledPin16 = 39;



const int boutonPin17 = 46;
const int ledPin17 = 47;

const int boutonPin18 = 42;
const int ledPin18 = 43;

const int boutonPin19 = 44;
const int ledPin19 = 45;

const int boutonPin20 = 48;
const int ledPin20 = 49;




const int boutonPin21 = 18;
const int ledPin21 = 19;

const int boutonPin22 = 52;
const int ledPin22 = 53;

const int boutonPin23 = 50;
const int ledPin23 = 51;

const int boutonPin24 = 16;
const int ledPin24 = 17;


const int ledsPins[] = {7, 5, 3, 9, 13, 25, 23, 11, 29, 31, 33, 27, 35, 37, 41, 39, 47, 43, 45, 49, 19, 53, 51, 17};

#include <FastLED.h>

// How many leds in your strip?
#define NUM_LEDS 54

// For led chips like WS2812, which have a data line, ground, and power, you just
// need to define DATA_PIN.  For led chipsets that are SPI based (four wires - data, clock,
// ground, and power), like the LPD8806 define both DATA_PIN and CLOCK_PIN
// Clock pin only needed for SPI based chipsets when not using hardware SPI
#define DATA_PIN 20


// Define the array of leds
CRGB leds[NUM_LEDS];
int jaugeLedsState[NUM_LEDS];

int buttonLedsState[24];

String data = "";

unsigned long previousMillis = 0;   // Stocke le temps du dernier changement d'état
const long interval = 200;          // Intervalle de temps pour le clignotement (en millisecondes)
bool blinkIsOn = true;

int nbActiveLeds = 0;

int nbJaugeEnd = 0;
unsigned long previousMillisJaugeEnd  = 0;
const long intervalJaugeEnd = 50;

void setup() {
  // delay(2000);

  Serial.begin(9600);
  FastLED.addLeds<WS2812, DATA_PIN, RGB>(leds, NUM_LEDS);

  pinMode(boutonPin1, INPUT_PULLUP);
  pinMode(boutonPin2, INPUT_PULLUP);
  pinMode(boutonPin3, INPUT_PULLUP);
  pinMode(boutonPin4, INPUT_PULLUP);
  pinMode(boutonPin5, INPUT_PULLUP);
  pinMode(boutonPin6, INPUT_PULLUP);
  pinMode(boutonPin7, INPUT_PULLUP);
  pinMode(boutonPin8, INPUT_PULLUP);
  pinMode(boutonPin9, INPUT_PULLUP);
  pinMode(boutonPin10, INPUT_PULLUP);
  pinMode(boutonPin11, INPUT_PULLUP);
  pinMode(boutonPin12, INPUT_PULLUP);
  pinMode(boutonPin13, INPUT_PULLUP);
  pinMode(boutonPin14, INPUT_PULLUP);
  pinMode(boutonPin15, INPUT_PULLUP);
  pinMode(boutonPin16, INPUT_PULLUP);
  pinMode(boutonPin17, INPUT_PULLUP);
  pinMode(boutonPin18, INPUT_PULLUP);
  pinMode(boutonPin19, INPUT_PULLUP);
  pinMode(boutonPin20, INPUT_PULLUP);
  pinMode(boutonPin21, INPUT_PULLUP);
  pinMode(boutonPin22, INPUT_PULLUP);
  pinMode(boutonPin23, INPUT_PULLUP);
  pinMode(boutonPin24, INPUT_PULLUP);

  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);
  pinMode(ledPin3, OUTPUT);
  pinMode(ledPin4, OUTPUT);
  pinMode(ledPin5, OUTPUT);
  pinMode(ledPin6, OUTPUT);
  pinMode(ledPin7, OUTPUT);
  pinMode(ledPin8, OUTPUT);
  pinMode(ledPin9, OUTPUT);
  pinMode(ledPin10, OUTPUT);
  pinMode(ledPin11, OUTPUT);
  pinMode(ledPin12, OUTPUT);
  pinMode(ledPin13, OUTPUT);
  pinMode(ledPin14, OUTPUT);
  pinMode(ledPin15, OUTPUT);
  pinMode(ledPin16, OUTPUT);
  pinMode(ledPin17, OUTPUT);
  pinMode(ledPin18, OUTPUT);
  pinMode(ledPin19, OUTPUT);
  pinMode(ledPin20, OUTPUT);
  pinMode(ledPin21, OUTPUT);
  pinMode(ledPin22, OUTPUT);
  pinMode(ledPin23, OUTPUT);
  pinMode(ledPin24, OUTPUT);

  resetJauge();

}

void loop() {
  int btn01Val = !digitalRead (boutonPin1);
  int btn02Val = !digitalRead (boutonPin2);
  int btn03Val = !digitalRead (boutonPin3);
  int btn04Val = !digitalRead (boutonPin4);
  int btn05Val = !digitalRead (boutonPin5);
  int btn06Val = !digitalRead (boutonPin6);
  int btn07Val = !digitalRead (boutonPin7);
  int btn08Val = !digitalRead (boutonPin8);
  int btn09Val = !digitalRead (boutonPin9);
  int btn10Val = !digitalRead (boutonPin10);
  int btn11Val = !digitalRead (boutonPin11);
  int btn12Val = !digitalRead (boutonPin12);
  int btn13Val = !digitalRead (boutonPin13);
  int btn14Val = !digitalRead (boutonPin14);
  int btn15Val = !digitalRead (boutonPin15);
  int btn16Val = !digitalRead (boutonPin16);
  int btn17Val = !digitalRead (boutonPin17);
  int btn18Val = !digitalRead (boutonPin18);
  int btn19Val = !digitalRead (boutonPin19);
  int btn20Val = !digitalRead (boutonPin20);
  int btn21Val = !digitalRead (boutonPin21);
  int btn22Val = !digitalRead (boutonPin22);
  int btn23Val = !digitalRead (boutonPin23);
  int btn24Val = !digitalRead (boutonPin24);


  String newData = "";

  newData.concat(btn01Val);
  newData.concat(btn02Val);
  newData.concat(btn03Val);
  newData.concat(btn04Val);
  newData.concat(btn05Val);
  newData.concat(btn06Val);
  newData.concat(btn07Val);
  newData.concat(btn08Val);
  newData.concat(btn09Val);
  newData.concat(btn10Val);
  newData.concat(btn11Val);
  newData.concat(btn12Val);
  newData.concat(btn13Val);
  newData.concat(btn14Val);
  newData.concat(btn15Val);
  newData.concat(btn16Val);
  newData.concat(btn17Val);
  newData.concat(btn18Val);
  newData.concat(btn19Val);
  newData.concat(btn20Val);
  newData.concat(btn21Val);
  newData.concat(btn22Val);
  newData.concat(btn23Val);
  newData.concat(btn24Val);

  if (newData != data) {
    Serial.println(newData);
  }

  data = newData;



  if (Serial.available() > 0) { // Vérifie s'il y a des données à lire

    String input = Serial.readStringUntil('\n'); // Lit la ligne envoyée

    if (input.startsWith("l/")) {
      // buttons lights
      String sequence = input.substring(2);

      for (int i = 0; i < sequence.length(); i++) {
        char currentValue = sequence.charAt(i); // Convertit le caractère en valeur numérique (0 ou 1)

        int buttonIndex = i;

        if (currentValue == '1') {
          buttonLedsState[buttonIndex] = 1;
          digitalWrite(ledsPins[buttonIndex], HIGH);
        }
        else if (currentValue == '0') {
          buttonLedsState[buttonIndex] = 0;
          digitalWrite(ledsPins[buttonIndex], LOW);
        }
        else if (currentValue == '2') {
          buttonLedsState[buttonIndex] = 2;
          digitalWrite(ledsPins[buttonIndex], LOW);
          // blink
        }
      }
    }


    else if (input.startsWith("s/")) {
      // strip leds
      String sequence = input.substring(2);

      for (int i = 0; i < sequence.length(); i++) {
        char currentValue = sequence.charAt(i); // Convertit le caractère en valeur numérique (0 ou 1)

        if (currentValue == '1') {
          jaugeLedsState[i] = 1;
        }
        else if (currentValue == '0') {
          jaugeLedsState[i] = 0;
        }
      }
    }




    else if (input.startsWith("j/")) {
      // jauge


      String sequence = input.substring(2);

      // jauge end
      if (sequence == "e") {
        nbJaugeEnd = NUM_LEDS;
        for (int i = 0; i < NUM_LEDS; i++) {
          jaugeLedsState[i] = 2;
        }
      }

      // jauge value
      else {

        // 0 to 54
        nbActiveLeds = int(sequence.toInt());

        for (int i = 0; i < NUM_LEDS; i++) {
          // update jaugeLedsState values
          if (i <= nbActiveLeds) {
            jaugeLedsState[i] = 1;
          } else {
            jaugeLedsState[i] = 0;
          }
        }
      }

      // then update leds
      showJaugeLeds();
    }




    else if (input.startsWith("e/")) {
      // jauge


      String sequence = input.substring(2);



      // 0 to 54
      nbJaugeEnd = int(sequence.toInt());

      for (int i = 0; i < NUM_LEDS; i++) {
        if (i <= nbJaugeEnd) {
          jaugeLedsState[i] = 2;
        } else {
          jaugeLedsState[i] = 0;
        }
      }


      // then update leds
      showJaugeLeds();
    }
  }




  // handle blink state
  unsigned long currentMillis = millis(); // Obtient le temps actuel

  if (currentMillis - previousMillis >= interval) { // Vérifie si l'intervalle est écoulé
    previousMillis = currentMillis; // Met à jour le temps du dernier changement d'état
    blinkIsOn = !blinkIsOn;

    showJaugeLeds();
    showButtonLeds();
  }
  /*
    if (currentMillis - previousMillisJaugeEnd >= intervalJaugeEnd) {
      previousMillisJaugeEnd = currentMillis; // Met à jour le temps du dernier changement d'état
      if (nbJaugeEnd > 0) {
        nbJaugeEnd--;
        if (nbJaugeEnd < 0) {
          nbJaugeEnd = 0;
        }
      }
    }*/


  //delay(20);
}

void showButtonLeds() {
  for (int i = 0; i < 24; i++) {
    if (buttonLedsState[i] == 1) {
      // vert rouge bleu
      // GRB
      digitalWrite(ledsPins[i], HIGH);
    }

    else if (buttonLedsState[i] == 0) {
      digitalWrite(ledsPins[i], LOW);
    }

    else if (buttonLedsState[i] == 2) {
      if (blinkIsOn) {
        digitalWrite(ledsPins[i], HIGH);
      } else {
        digitalWrite(ledsPins[i], LOW);
      }
    }
  }
}

void showJaugeLeds() {
  for (int i = 0; i < NUM_LEDS; i++) {
    if (jaugeLedsState[i] == 1) {
      // vert rouge bleu
      // GRB

      // Mode dégradé
      int g = int(map(i, 0, NUM_LEDS, 255, 0));

      if (nbActiveLeds < 30 || (blinkIsOn && nbActiveLeds >= 30)) {
        leds[i] = CRGB(g, 255, 0);
      } else {
        leds[i] = CRGB(0, 0, 0);
      }
    }

    else if (jaugeLedsState[i] == 0) {
      leds[i] = CRGB(0, 0, 0);
    }

    else if (jaugeLedsState[i] == 2) {
      /*
        if (i <= nbJaugeEnd) {

        int r = max(map(nbJaugeEnd, NUM_LEDS, 10, 255, 0), 0);

        leds[i] = CRGB(0, r, 0);
        } else {
        leds[i] = CRGB(0, 0, 0);
        }
      */

      int r = max(map(nbJaugeEnd, NUM_LEDS, 0, 255, 0), 0);

      leds[i] = CRGB(0, r, 0);

    }
  }

  FastLED.show();
}

void resetJauge() {

  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB(0, 0, 0);
  }

  FastLED.show();
}




// Mode Paliers
/*
  if (i < 18) {
  leds[i] = CRGB(255, 255, 255);
  } else if (i < 30) {
  leds[i] = CRGB(255, 255, 0); // jaune
  } else if (i < 42) {
  leds[i] = CRGB(90, 255, 0); // orange
  } else {
  leds[i] = CRGB(0, 255, 0); // rouge
  }

*/
