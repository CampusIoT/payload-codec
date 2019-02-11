//*****************************************************************************
// Javascript codec functions for Semtech LoRaMote endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

// Value used for the conversion of the position from DMS to decimal
const MaxNorthPosition = 8388607; // 2^23 - 1
const MaxSouthPosition = 8388608; // -2^23
const MaxEastPosition = 8388607; // 2^23 - 1
const MaxWestPosition = 8388608; // -2^23

/*
In LoRaWAN Spec 1.0 (page 75/80)
16.3.1 Gateway GPS coordinate:1 InfoDesc = 0, 1 or 2
2 For InfoDesc = 0 ,1 or 2, the content of the Info field encodes the GPS coordinates of the
3 antenna broadcasting the beacon
Size (bytes) 3 3
Info Lat Lng
4 The latitude and longitude fields (Lat and Lng, respectively) encode the geographical
5 location of the gateway as follows:
6 • The north-­south latitude is encoded using a signed 24 bit word where -­223
7 corresponds to 90° south (the South Pole) and 223 corresponds to 90° north (the
8 North Pole). The equator corresponds to 0.
9 • The east-­west longitude is encoded using a signed 24 bit word where -­
10 223corresponds to 180° west and 223 corresponds to 180° east. The Greenwich
11 meridian corresponds to 0.
*/

// Utility functions
Number.prototype.roundUsing = function (func, prec) {
    var temp = this * Math.pow(10, prec);
    temp = func(temp);
    return temp / Math.pow(10, prec);
}

function getDegree(payload, pos, maxDeg) {
    // payload is a baffer containing 3 bytes (signed 24b integer) at position pos
    // maxDeg is 90 for latitude and 180 for longitude

    var val = payload[pos+0]<<16 + payload[pos+1]<<8 + payload[pos+2]; // BE or LE
    res = (val * maxDeg / MaxEastPosition).roundUsing(Math.ceil, 5);

    return res;
}

Semtech_LoRaMote_Payload = {
	// for default firmware of loranet/loranode
    'decodeUp': function (port,payload) {
    	// TODO check port

    	var value = {};

        var _appLedStateOn = payload[0];
        value["led"] = _appLedStateOn;

        var _pressure = Math.round(payload.readInt16BE(1) / 10); // in hPa
        value["pressure"] = _pressure;

        var _temperature = (payload.readInt16BE(3) / 100.0).roundUsing(Math.ceil, 1); // in °C
        value["temperature"] = _temperature;

        var _altitudeBar = Math.round(payload.readInt16BE(5) / 10); // in m
        value["altitudeBar"] = _altitudeBar;

        var _batteryLevel = Math.round((payload[7] * 100) / 254); // in %
        value["battery"] = _batteryLevel;

        // TODO undefined latitude
         // TODO should fix for negative latitude
         // IN THIS VERSION,
        var _latitude = payload.readUInt32BE(8);
        //console.log("_latitude:",_latitude);
        //_latitude = _latitude & 0x00FFFFFF;
        _latitude = _latitude >> 8;
        //console.log("_latitude:",_latitude);
        _latitude = (_latitude * 90.0 / MaxNorthPosition).roundUsing(Math.ceil, 5);
        //console.log("_latitude:",_latitude);
        value["latitude"] = _latitude;

        // TODO undefined longitude
        // TODO should fix for negative longitude
        var _longitude = payload.readUInt32BE(11);
        //console.log("_longitude:",_longitude);
        //_longitude = _longitude & 0x00FFFFFF;
        _longitude = _longitude >> 8;
        //console.log("_longitude:",_longitude);
        _longitude = (_longitude * 180.0 / MaxEastPosition).roundUsing(Math.ceil, 5);
        //console.log("_longitude:",_longitude);
        value["longitude"] = _longitude;

        // altitude
        if(value.latitude !== undefined && value.longitude !== undefined) {
          var _altitudeGps = payload.readInt16BE(14); // in m
          if (_altitudeGps === -256) _altitudeGps = 0;
          value["altitudeGps"] = _altitudeGps;
        }

    	return value;
    },

    'getLatlng': function (port,value) {
        if(value.latitude !== undefined && value.longitude !== undefined) {
            return {lat: value.latitude, lng:value.longitude};
        } else {
            return undefined;
        }
    },

  // encodes the given object into an array of bytes
  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }
}

module.exports.Decoder = Semtech_LoRaMote_Payload;
