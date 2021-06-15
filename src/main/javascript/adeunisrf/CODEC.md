# Codec for Adeunis RF endpoints

Manufacturer website: https://www.adeunis.com/en/produits/products/

Networks: LoRaWAN, Sigfox

ISM Bands: eu868, us915

## Endpoints
### Field Test Device
* Class : A, C
* Measurements: temperature, humidity, latitude, longitude, downlink snr/rssi, button
* Website: https://www.adeunis.com/en/produit/ftd-868-915-2/
* Specification:

### DemoMote
* Class : A, C
* Measurements: temperature, humidity, latitude, longitude, downlink snr/rssi, button
* Website:
* Specification:
* Status: retired

### Sensor
* Class : A
* Measurements: 2 channels for analogic, digital, dry contact
* Website:
* Specification:

### Pulse
* Class : A
* Measurements: 2 channels for pulse smartmeters (water, gas, electricity)
* Website:
* Specification:

### Temp
* Class : A
* Measurements: internal temperature, external temperature
* Website:
* Specification:

### All (ie others) : COMFORT, DRY CONTACTS, MOTION, PULSE, Pulse 3, TEMP, Temp 3, REPEATER, DELTA P
* The decoder relies on the codec Javascript lib provided by Adeunis RF http://codec-adeunis.com/decoder


## Usage

```shell
node
```


```javascript
var codec = require ('./adeunisrf_demomote_codec.js')
var o = codec.Decoder.decodeUp(10,new Buffer("9e10450058400043962028000cdd","hex"));
var gm = "https://www.google.fr/maps/place/"+o.latitude+","+o.longitude;
console.log(o);
console.log(gm);
```

```json
{
  accelerometerTrigger: false,
  button1Trigger: false,
  temperature: 16,
  latitude: 45.00973333333334,
  longitude: 4.660333333333334,
  uplinkCounter: 40,
  downlinkCounter: 0,
  batteryVoltage: 3293
}
https://www.google.fr/maps/place/45.00973333333334,4.660333333333334
```


# Disclaimer
This disclaimer informs readers that the information written in the text belong solely to the author, and not necessarily to the author’s employer, organization, committee or other group or individual. The author try to gather synthetic and accurate information about the manufacturer's endpoints. Endpoint manufacturer are welcome to pull a request in order to correct and to improve this text.
