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
	        var temperature = p.readInt8(1); // in °C
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

	        var uplinkCounter=p.readUInt8(10);
	        value["uplinkCounter"]=uplinkCounter;

	        var downlinkCounter=p.readUInt8(11);
	        value["downlinkCounter"]=downlinkCounter;

	        var batteryVoltage = p.readInt16BE(12); // in mV
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
	        var temperature = p.readInt8(1); // in °C
	        value["temperature"]=temperature;

	        var uplinkCounter=p.readUInt8(2);
	        value["uplinkCounter"]=uplinkCounter;

	        var downlinkCounter=p.readUInt8(3);
	        value["downlinkCounter"]=downlinkCounter;

	        var batteryVoltage = p.readInt16BE(4); // in mV
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
