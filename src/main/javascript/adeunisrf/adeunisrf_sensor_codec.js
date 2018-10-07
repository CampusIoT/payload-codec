//*****************************************************************************
// Javascript codec functions for Adeunis Sensor endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

AdeunisRF_ARF8045_Sensor_Payload = {

	'getChannelTypeStr': function (type) {
		switch(type) {
    	case 0:
        	return "Sensor switch / Pulse none";
	        break;
    	case 1:
        	return "Sensor analog, auto mode (0/10V or 4/20mA)";
	        break;
    	case 2:
        	return "Sensor Dry Contact";
	        break;
    	case 10:
        	return "Sensor temperature";
	        break;
    	case 11:
        	return "Sensor 4-20 mA";
	        break;
    	case 12:
        	return "Sensor 0-10V";
	        break;
	    default:
	        return undefined;
	    }
	},

	'getChannelTypeName': function (type) {
		switch(type) {
    	case 0:
        	return "switch";
	        break;
    	case 1:
        	return "analog";
	        break;
    	case 2:
        	return "contact";
	        break;
    	case 10:
        	return "temperature";
	        break;
    	case 11:
        	return "current";
	        break;
    	case 12:
        	return "voltage";
	        break;
	    default:
	        return undefined;
	    }
	},


    'decodeUp': function (port,payload) {
	    var value = {};

    	// TODO check port

		// cf 4.1.1

    	var p = payload;

    	// check length : must be 12-byte long.
    	var code 		= p[0];
	    value["code"] = code;

	    var status 		= p[1];
	    var error		= status & 0x0F;

	    if(error === 0) {

		} else if((error & 0x01) !== 0) {
		    value["configurationdone"] 			= true;
		} else if((error & 0x02) !== 0) {
	    	value["lowbaterror"]				= true;
		} else if((error & 0x04) !== 0) {
		    value["configurationswitcherror"] 	= true;
		} else if((error & 0x08) !== 0) {
		    value["hwerror"] 					= true;
		}

	    value["counter"] = status >> 4;


    	if(code === 0x01) {
    		// length is 10
	    	var sensor1type		= p[2];
	    	var sensor1measure	= p[3]+(p[4]<<8)+(p[5]<<16); // LSB First
	    	var sensor2type		= p[6];
	    	var sensor2measure	= p[7]+(p[8]<<8)+(p[9]<<16); // LSB First

	    	if(sensor1type !== 0) {
		    	value["sensor1type"] 		= sensor1type;
		    	value["sensor1typestr"] 	= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(sensor1type);
		    	value["sensor1measure"] 	= sensor1measure;
		    	value[AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeName(sensor1type)] 	= sensor1measure;
	    	}
	    	if(sensor2type !== 0) {
		    	value["sensor2type"] 		= sensor2type;
		    	value["sensor2typestr"] 	= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(sensor2type);
		    	value["sensor2measure"] 	= sensor2measure;
		    	if(sensor1type !== sensor2type) {
		    		value[AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeName(sensor2type)] = sensor2measure;
		    	} else {
		    		// TODO A array of sensor values
		    	}
		    }
    	} else if(code === 0x03) {
			// length is 10
	    	var status 				= p[1];
	    	value["status"] 		= status;
	    	var devicetype 			= p[2];
	    	value["devicetype"] 	= devicetype;
	    	var transmitperiod 		= p[3]+(p[4]<<8); // LSB First;
	    	value["transmitperiod"] = transmitperiod;
	    	var channel		 		= p[5];
	    	value["channel"] 		= channel;
	    	var channel1type 		= p[6];
	    	value["channel1type"] 	= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(channel1type);
	    	var channel2type 		= p[7];
	    	value["channel2type"] 	= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(channel2type);
	    	var pulseinputtype		= p[8];
	    	value["pulseinputtype"] = pulseinputtype;
	    	var memoswitch			= p[9];
	    	value["memoswitch"] 	= memoswitch;

    	} else if(code === 0x00) {
			// length is 12
    		// Reserved
	    	var status 				= p[1];
	    	value["status"] 		= status;

    	}
	    return value;
	},

  // encodes the given object into an array of bytes
  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }
}
