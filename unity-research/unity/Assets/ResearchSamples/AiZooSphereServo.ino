#include <Servo.h>
#include <math.h>

const bool calibrated = false;
const int pins[3] = {3, 5, 6};
const int neutral[3] = {90, 90, 90};
const int minimum[3] = {80, 80, 80};
const int maximum[3] = {100, 100, 100};
Servo motors[3];
char line[48];
int length = 0;
int speedValue = 0;
int powerValue = 0;
int phaseValue = 0;
unsigned long lastCue = 0;

void setup()
{
    Serial.begin(115200);
    if (!calibrated) return;
    for (int i = 0; i < 3; ++i)
    {
        motors[i].write(neutral[i]);
        motors[i].attach(pins[i]);
    }
}

void loop()
{
    while (Serial.available() > 0)
    {
        char c = Serial.read();
        if (c == '\n')
        {
            line[length] = '\0';
            int s, p, phase, light;
            if (sscanf(line, "M,%d,%d,%d,%d", &s, &p, &phase, &light) == 4 &&
                s >= 0 && s <= 100 && p >= 0 && p <= 100 &&
                phase >= 0 && phase <= 100 && light >= 0 && light <= 100)
            {
                speedValue = s;
                powerValue = p;
                phaseValue = phase;
                lastCue = millis();
            }
            length = 0;
        }
        else if (length < (int)sizeof(line) - 1 && c >= 32 && c <= 126)
        {
            line[length++] = c;
        }
        else
        {
            length = 0;
        }
    }

    if (!calibrated) return;
    if (millis() - lastCue > 1000)
    {
        speedValue = 0;
        powerValue = 0;
    }
    float frequency = 0.2f + speedValue / 100.0f * 1.8f;
    float clock = millis() / 1000.0f * frequency * 6.2831853f;
    for (int i = 0; i < 3; ++i)
    {
        int amplitude = min(neutral[i] - minimum[i], maximum[i] - neutral[i]);
        float offset = i * phaseValue / 100.0f * 2.1f;
        int angle = neutral[i] + roundf(sinf(clock + offset) * amplitude * powerValue / 100.0f);
        motors[i].write(constrain(angle, minimum[i], maximum[i]));
    }
    delay(20);
}
