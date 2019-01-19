//*****************************************************************************
// Javascript codec functions for Adeunis FTD endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

function readInt16BE (buf, offset) {
  offset = offset >>> 0
  var val = buf[offset + 1] | (buf[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

function readInt8 (buf, offset) {
  offset = offset >>> 0
  if (!(buf[offset] & 0x80)) return (buf[offset])
  return ((0xff - buf[offset] + 1) * -1)
}

function readUInt8 (buf, offset) {
  offset = offset >>> 0
  return (buf[offset])
}

// https://www.adeunis.com/wp-content/uploads/2017/08/FTD_LoRaWAN_EU863-870_UG_FR_GB_V1.2.2.pdf
AdeunisRF_ARF8123AA_FieldTestDevice_Payload = {
  'decodeUp': function (port,payload) {

      var value = {}
      var p = payload;

      /*
      Bit 7 : Présence de l’information de température
      Bit 6 : Déclenchement de l’émission par l’accéléromètre
      Bit 5 : Déclenchement de l’émission par appui sur le bouton poussoir 1
      Bit 4 : Présence de l’information GPS
      Bit 3 : Présence du compteur de trame d’Uplink
      Bit 2 : Présence du compteur de trame de Downlink
      Bit 1 : Présence de l’information du niveau de batterie
      Bit 0 : Présence de l’informaiotn RSSI et SNR
      */

    var flags = p[0];

    var accelerometerTrigger=((flags&0x40) !== 0);
    value["accelerometerTrigger"]=accelerometerTrigger;

    var button1Trigger=((flags&0x20) !== 0);
    value["button1Trigger"]=button1Trigger;

    var index = 1;

    // decode Adeunis payload

    if((flags & 0x80) !== 0) {
          var temperature = readInt8(p,index++); // in °C
          value["temperature"]=temperature;
        }

    if((flags & 0x10) !== 0) {
          var latdegrees=(((p[index]&0xF0) >> 4) * 10) + (p[index++]&0x0F);
          var latminutes=    (((p[index]&0xF0) >> 4) * 10)
                          + (p[index++]&0x0F)
                          + (((p[index]&0xF0) >> 4) /10)
                          + ((p[index++]&0x0F) / 100)
                          + (((p[index]&0xF0) >> 4) /1000)
                          ;
          var latitude = (latdegrees + (latminutes / 60));
          if((p[index++]&0x01)==1) latitude=-latitude;
          value["latitude"]=latitude;

          var londegrees=(((p[index]&0xF0) >> 4) * 100) + ((p[index++]&0x0F)* 10) + ((p[index]&0xF0) >> 4);
          var lonminutes= ((p[index++]&0x0F) * 10)
                          + ((p[index]&0xF0) >> 4)
                          + ((p[index++]&0x0F) / 10)
                          + (((p[index]&0xF0) >> 4) /100)
                          ;
          var longitude = (londegrees + (lonminutes / 60));
          if((p[index++]&0x01)==1) longitude=-longitude;
          value["longitude"]=longitude;

          var gpsquality = readUInt8(p,index++);
          value["satellites"]=gpsquality&0x0F;
          value["quality"]=gpsquality >> 4;

      }

    if((flags & 0x08) !== 0) {
          var uplinkCounter=readUInt8(p,index++);
          value["uplinkCounter"]=uplinkCounter;
      }

    if((flags & 0x04) !== 0) {
          var downlinkCounter=readUInt8(p,index++);
          value["downlinkCounter"]=downlinkCounter;
      }

    if((flags & 0x02) !== 0) {
          var batteryVoltage = readInt16BE(p,index); // in mV
          index = index + 2;
          value["batteryVoltage"]=batteryVoltage;
    }

    if((flags & 0x01) !== 0) {
          var rssi = readUInt8(p,index++); // in dB absolute value
          var snr = readInt8(p,index++); // in dB, signed
          value["rssi"]= - rssi;
          value["snr"]=snr;
    }

    return value;
  },

  // encodes the given object into an array of bytes
  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }
}

// For LoRaServer.io
// Decode decodes an array of bytes into an object.
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - fPort contains the LoRaWAN fPort number
// The function must return an object, e.g. {"temperature": 22.5}
function Decoder(bytes, fPort) {
  return AdeunisRF_ARF8123AA_FieldTestDevice_Payload.decodeUp(fPort,bytes);
}

// For LoRaServer.io
// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
  return Decoder(bytes, fPort)
}

module.exports.Decoder = Decoder;
module.exports.Decode = Decode;
