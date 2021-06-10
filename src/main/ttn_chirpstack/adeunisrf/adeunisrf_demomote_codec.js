//*****************************************************************************
// Javascript codec functions for Adeunis DemoMote endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

AdeunisRF_ARF8084BA_Motev10_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port
    	var p = payload;

	    if (p.length === 14) {

	    	var value = {};

	        var accelerometerTrigger=((p[0]&0x40) != 0);
	        value["accelerometerTrigger"]=accelerometerTrigger;

	        var button1Trigger=((p[0]&0x20) != 0);
	        value["button1Trigger"]=button1Trigger;

	        // decode Adeunis payload
	        //var temperature = getCalibratedTemperature(deveui,p.readInt8(1)); // in °C
			// TEMPERATURE IN NOT CALIBRATED
	        var temperature = p[1]; // in °C
	        value["temperature"]=temperature;

	        var latdegrees=(((p[2]&0xF0) >> 4) * 10) + (p[2]&0x0F);
	        var latminutes=    (((p[3]&0xF0) >> 4) * 10)
	                        + (p[3]&0x0F)
	                        + (((p[4]&0xF0) >> 4) /10)
	                        + ((p[4]&0x0F) / 100)
	                        + (((p[5]&0xF0) >> 4) /1000)
	                        ;
	        var latitude = (latdegrees + (latminutes / 60));
	        if((p[5]&0x0F)==1) latitude=-latitude;
	        value["latitude"]=latitude;


	        var londegrees=(((p[6]&0xF0) >> 4) * 100) + ((p[6]&0x0F)* 10) + ((p[7]&0xF0) >> 4);
	        var lonminutes= ((p[7]&0x0F) * 10)
	                        + ((p[8]&0xF0) >> 4)
	                        + ((p[8]&0x0F) / 10)
	                        + (((p[9]&0xF0) >> 4) /100)
	                        ;
	        var longitude = (londegrees + (lonminutes / 60));
	        if((p[9]&0x0F)==1) longitude=-longitude;
	        value["longitude"]=longitude;

	        var uplinkCounter=p[10];
	        value["uplinkCounter"]=uplinkCounter;

	        var downlinkCounter=p[11];
	        value["downlinkCounter"]=downlinkCounter;

          var batteryVoltage = (p[12]<<8) + (p[13]) ; // in mV
	        value["batteryVoltage"]=batteryVoltage;

	    	return value;

	    } else if (p.length === 6) {

	    	var value = {};

	        var accelerometerTrigger=((p[0]&0x40) != 0);
	        value["accelerometerTrigger"]=accelerometerTrigger;

	        var button1Trigger=((p[0]&0x20) != 0);
	        value["button1Trigger"]=button1Trigger;

	        // decode Adeunis payload
	        //var temperature = getCalibratedTemperature(deveui,p.readInt8(1)); // in °C
	        var temperature = p[1]; // in °C
	        value["temperature"]=temperature;

	        var uplinkCounter=p[2];
	        value["uplinkCounter"]=uplinkCounter;

	        var downlinkCounter=p[3];
	        value["downlinkCounter"]=downlinkCounter;

          var batteryVoltage = (p[4]<<8) + (p[5]) ; // in mV
	        value["batteryVoltage"]=batteryVoltage;

	    	return value;
	    } else {
	    	return undefined;
	    }
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

// For LoRaServer.io
// Decode decodes an array of bytes into an object.
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - fPort contains the LoRaWAN fPort number
// The function must return an object, e.g. {"temperature": 22.5}
function Decoder(bytes, fPort) {
  return AdeunisRF_ARF8084BA_Motev10_Payload.decodeUp(fPort,bytes);
}

  // For chirpstack.io
  // Decode decodes an array of bytes into an object.
  //  - fPort contains the LoRaWAN fPort number
  //  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
  // The function must return an object, e.g. {"temperature": 22.5}
  function Decode(fPort, bytes, variables) {
    return Decoder(bytes, fPort)
  }
  
  //module.exports.Decoder = Decoder;
  //module.exports.Decode = Decode;
  