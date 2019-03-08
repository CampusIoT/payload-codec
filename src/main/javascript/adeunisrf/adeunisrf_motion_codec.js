//*****************************************************************************
// Javascript codec functions for Adeunis Motion endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

// https://www.adeunis.com/wp-content/uploads/2018/10/SMART_BUILDING_MOTION_LoRaWAN_V1.0.0_FR_EN.pdf



const TYPE_INFO_PROD=0x10;
const TYPE_CONFIG=0x1F;
const TYPE_INFO_NWK=0x20;
const TYPE_KEEP_ALIVE=0x30;
const TYPE_PERIODIC=0x4E;
const TYPE_ALARM_MOTION=0x4F;
const TYPE_ALARM_LIGHT=0x50;
const TYPE_ALARM_TOR1=0x51;
const TYPE_ALARM_TOR2=0x52;


AdeunisRF_Motion_Payload = {

    'decodeUp': function (port,payload) {
	    var value = {};

    	// TODO check port

    	var p = payload;

    	// check length : must be 12-byte long.
      if(p.length < 3) return undefined;

    	var code 		= p[0];
    	var status 		= p[1];
	    var error		= status & 0x0F;

	    if(error === 0) {
		    value["noerror"] = true;
  		} else if((error & 0x01) !== 0) {
  		    value["configurationdone"] = true;
  		} else if((error & 0x02) !== 0) {
  	    	value["lowbaterror"] = true;
  		} else if((error & 0x04) !== 0) {
  		    value["hwerror"] = true;
  		}

	    value["counter"] = status >> 5;
      value["code"] 	= code;

    	if((code === TYPE_INFO_PROD) && (p.length === 12)) {
        value["type"] 	= "prod";
    	} else if((code === TYPE_ALARM_MOTION) && (p.length === 6)) {
        value["type"] 	= "motion";

        value["motion_total"] 	= p[2]+(p[3]<<8);
        value["motion"] 	= p[4]+(p[5]<<8);

      } else if((code === TYPE_ALARM_LIGHT) && (p.length === 4)) {
        value["type"] 	= "light";

        value["light_alarm"] 	= (p[2] !== 0);
        value["light"] 	= p[3];

      } else if((code === TYPE_ALARM_LIGHT) && (p.length === 9)) {
        value["type"] 	= "light";

        // TODO p[2]
        value["tor1_total"] 	= p[3]+(p[4]<<8)+(p[5]<<16)+(p[6]<<24);
        value["tor1"] 	= p[7]+(p[8]<<8);

      } else {
        value = undefined;
    	}

	    return value;
	}
},

  // encodes the given object into an array of bytes
  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }
}

module.exports.Decoder = AdeunisRF_Motion_Payload;
