//*****************************************************************************
// Javascript codec functions for Adeunis FTD endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

// https://www.adeunis.com/wp-content/uploads/2017/08/ARF8123AA_ADEUNIS_LORAWAN_FTD_UG_V1.2.0_FR_GB.pdf
AdeunisRF_ARF8123AA_FieldTester_Payload = {
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
        
    var flags = p.readUInt8(0);

    var accelerometerTrigger=((flags&0x40) !== 0);
    value["accelerometerTrigger"]=accelerometerTrigger;

    var button1Trigger=((flags&0x20) !== 0);
    value["button1Trigger"]=button1Trigger;

    var index = 1;

    // decode Adeunis payload

    if((flags & 0x80) !== 0) {
          var temperature = p.readInt8(index++); // in °C
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

          var gpsquality = p.readUInt8(index++);
          value["satellites"]=gpsquality&0x0F;
          value["quality"]=gpsquality >> 4;

      }

    if((flags & 0x08) !== 0) {
          var uplinkCounter=p.readUInt8(index++);
          value["uplinkCounter"]=uplinkCounter;
      }

    if((flags & 0x04) !== 0) {
          var downlinkCounter=p.readUInt8(index++);
          value["downlinkCounter"]=downlinkCounter;
      }

    if((flags & 0x02) !== 0) {
          var batteryVoltage = p.readInt16BE(index); // in mV
          index = index + 2;
          value["batteryVoltage"]=batteryVoltage;
    }

    if((flags & 0x01) !== 0) {
          var rssi = p.readUInt8(index++); // in dB absolute value
          var snr = p.readUInt8(index++); // in dB, signed
          value["dn_rssi"]= - rssi;
          value["dn_snr"]=snr;
    }

    return value;
  },

  // encodes the given object into an array of bytes
  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }
}


module.exports.Decoder = AdeunisRF_ARF8123AA_FieldTestDevice_Payload;
