//3 joysticks - 3 boutons - 3 leds

//joystick 1

int j01h = 2;
int j01b = 3;
int j01g = 4;
int j01d = 5;

//joystick 2

int j02h = 6;
int j02b = 7;
int j02g = 8;
int j02d = 9;

//joystick 3

int j03h = 10;
int j03b = 11;
int j03g = 12;
int j03d = 13;

//boutons

int b01 = 14;
int b02 = 15;
int b03 = 16;


String data = "";



void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  pinMode (j01h, INPUT_PULLUP);
  pinMode (j01b, INPUT_PULLUP);
  pinMode (j01g, INPUT_PULLUP);
  pinMode (j01d, INPUT_PULLUP);

  pinMode (j02h, INPUT_PULLUP);
  pinMode (j02b, INPUT_PULLUP);
  pinMode (j02g, INPUT_PULLUP);
  pinMode (j02d, INPUT_PULLUP);

  pinMode (j03h, INPUT_PULLUP);
  pinMode (j03b, INPUT_PULLUP);
  pinMode (j03g, INPUT_PULLUP);
  pinMode (j03d, INPUT_PULLUP);

  pinMode (b01, INPUT_PULLUP);
  pinMode (b02, INPUT_PULLUP);
  pinMode (b03, INPUT_PULLUP);
}

void loop() {

  int j01hVal = !digitalRead(j01h);
  int j01bVal = !digitalRead(j01b);
  int j01gVal = !digitalRead(j01g);
  int j01dVal = !digitalRead(j01d);

  int j02hVal = !digitalRead(j02h);
  int j02bVal = !digitalRead(j02b);
  int j02gVal = !digitalRead(j02g);
  int j02dVal = !digitalRead(j02d);

  int j03hVal = !digitalRead(j03h);
  int j03bVal = !digitalRead(j03b);
  int j03gVal = !digitalRead(j03g);
  int j03dVal = !digitalRead(j03d);

  int b01Val = !digitalRead (b01);
  int b02Val = !digitalRead (b02);
  int b03Val = !digitalRead (b03);

  String newData = "";

  newData.concat(j03hVal);
  newData.concat(j03dVal);
  newData.concat(j03bVal);
  newData.concat(j03gVal);
  newData.concat(b03Val);

  newData.concat("/");

  newData.concat(j02hVal);
  newData.concat(j02dVal);
  newData.concat(j02bVal);
  newData.concat(j02gVal);
  newData.concat(b02Val);
  
  newData.concat("/");
  
  newData.concat(j01hVal);
  newData.concat(j01dVal);
  newData.concat(j01bVal);
  newData.concat(j01gVal);
  newData.concat(b01Val);

  if (newData != data) {
    Serial.println(newData);
  }

  data = newData;
  /*
    Serial.print(j01bVal);
    Serial.print(" ");
    Serial.print(j01gVal);
    Serial.print(" ");
    Serial.print(j01dVal);
    Serial.print(" ");

    Serial.print(j02hVal);
    Serial.print(" ");
    Serial.print(j02bVal);
    Serial.print(" ");
    Serial.print(j02gVal);
    Serial.print(" ");
    Serial.print(j02dVal);
    Serial.print(" ");

    Serial.print(j03hVal);
    Serial.print(" ");
    Serial.print(j03bVal);
    Serial.print(" ");
    Serial.print(j03gVal);
    Serial.print(" ");
    Serial.print(j03dVal);
    Serial.print(" ");

    Serial.print(b01Val);
    Serial.print(" ");
    Serial.print(b02Val);
    Serial.print(" ");
    Serial.println(b03Val);
  */

  delay(10);

}
