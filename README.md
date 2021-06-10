# LoRaWAN endpoint Payload Codec

Codec functions for encoding and decoding payloads of (mainly LoRaWAN) endpoints messages

Languages: Javascript, Java, Python, Go, C++, NodeRED

Application servers integration : [TTN](./ttn_chirpstack), [Chirpstack](ttn_chirpstack)

Networks: [LoRaWAN](https://lora-alliance.org/), Sigfox

## Usage
# Javascript
* NodeRED
* [TTN](./ttn_chirpstack)
* [Chirpstack](ttn_chirpstack)

## TODO: LoRaWAN® Device Identification QR Codes for Automated Onboarding
Soon
* QRCode generator
* List of ProfileID (ie Vendor Identifier and Vendor Profile Identifier)

## TODO: LoRaWAN® App Payload Codec API
Soon
* Javascript codecs will (probably) implement 3 functions: ```decodeUL(bytes,fport)```, ```decodeDL(bytes,fport)``` and ```encodeDL(bytes,fport)```.