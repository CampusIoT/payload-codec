//*****************************************************************************
// Javascript codec functions for Sensing Labs endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

SensingLabs_SenlabH_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port

		// port is 3

    	var value =  {};

    	var len = payload.length;

		//var _id = payload.readInt8(0);
        //value["id"] === 0x03;

		// the battery level expressed in 1/254 %
		var _battery = payload.readUInt8(1);
        value["batteryLevel"] = ((_battery * (1/254.0))*100);

        // 	temperature expressed in 1/16 °C as a 2 bytes signed int
		var _temperature = payload.readInt16BE(len-3);
        value["temperature"] = (_temperature * (1/16.0));


        //  humidity expressed in % as 8bits signed int [0-100%]
		var _humidity = payload.readInt8(len-1);
        value["humidity"] = (_humidity);

    	return value;
	},

  // encodes the given object into an array of bytes
  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }

}
