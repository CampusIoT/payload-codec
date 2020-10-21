//*****************************************************************************
// Javascript codec functions for Adeunis Temp endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

function readInt16BE (buf, offset) {
  offset = offset >>> 0
  var val = buf[offset + 1] | (buf[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

AdeunisRF_Temp_Payload = {

    'decodeUp': function (port,payload) {
	    var value = {};

    	// TODO check port

		  // cf 4.1.1

    	var p = payload;

    	// check length : must be 12-byte long.
    	var code 		= p[0];
    	var status 		= p[1];
	    var status 		= p[1];
	    var error		= status & 0x0F;

	    if(error === 0) {
		    value["noerror"] 			= true;
		} else if((error & 0x01) !== 0) {
		    value["configurationdone"] 			= true;
		} else if((error & 0x02) !== 0) {
	    	value["lowbaterror"]				= true;
		} else if((error & 0x04) !== 0) {
		    value["hwerror"] 					= true;
		}

	    value["counter"] = status >> 5;

    	if(code === 0x30) {
    		// length is 8
	    	var internalId	= p[2]
	    	var internalValue	= p[3]+(p[4]<<8); // LSB First
	    	var externalId		= p[5];
	    	var externalValue	= p[6]+(p[7]<<8); // LSB First

 	    	value["code"] 	= code;
		    value["internal_id"] 	= internalId;
		    value["temperature_internal"] 	= internalValue/10.0;
		    value["external_id"] 	= externalId;
		    value["temperature_external"] 	= externalValue/10.0;

    	} else if(code === 0x43) {
    		// length is 8
	    	var internalId	= p[2]
	    	//var internalValue	= p[3]+(p[4]<<8); // LSB First
	    	var internalValue	= readInt16BE(p,3)/10.0;
	    	var externalId		= p[5];
	    	// var externalValue	= p[6]+(p[7]<<8); // LSB First
	    	var externalValue	= readInt16BE(p,6)/10.0;

 	    	value["code"] 	= code;
		    value["internal_id"] 	= internalId;
		    value["temperature_internal"] 	= internalValue;
		    value["external_id"] 	= externalId;
		    value["temperature_external"] 	= externalValue;

        } else if(code === 0x20) {
			// length is 4
	    	var adr	    = (p[2] === 1);
	    	var otaa    = (p[3] === 1);
 	    	value["code"] 	= code;
	    	value["adr"] 	= adr;
		    value["otaa"] 	= otaa;
    	} else if(code === 0x11) {
			// length is 99
    		// TODO
    		/*
    		Octets 2 à 3 : registre 324, seuil haut du capteur interne, octet de poids fort en premier
            • Octet 4 : registre 325, hystérésis seuil haut du capteur interne
            • Octets 5 à 6 : registre 326, seuil bas du capteur interne, octet de poids fort en premier
            • Octet 7 : registre 327, hystérésis seuil bas du capteur interne
            • Octet 8 : registre 333, facteur de sur-échantillonnage
            */
 	    	value["code"] 	= code;
 	    	value["status"] 	= status;
   		    return value;

    	} else if(code === 0x10) {
			// length is 11
    		// TODO
    		/*
    		• Octet 2 : registre 300, périodicité de la trame de vie, exprimé en dizaine de minutes
            • Octet 3 : registre 301, périodicité de la transmission (Mode périodique), exprimé en dizaine de minutes
            • Octet 4 : registre 320, configuration du capteur interne
            • Octet 5 : registre 321, configuration des évènements du capteur interne
            • Octet 6 : registre 322, configuration du capteur externe
            • Octet 7 : registre 323, configuration des évènements du capteur externe
            • Octet 8 : registre 306, mode du produit (PARC, STANDARD (production), TEST ou REPLI)
            • Octet 9 : type de capteur externe :
            o 0 = désactivé
            o 1 = inconnu
            o 2 = FANB57863-400-1
            • Octet 10 : registre 332, périodicité de l’acquisition, exprimé en minute
            */
 	    	value["code"] 	= code;
 	    	value["status"] 	= status;
   		    return value;

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

// For TTN
// Decode decodes an array of bytes into an object.
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - fPort contains the LoRaWAN fPort number
// The function must return an object, e.g. {"temperature": 22.5}
function Decoder(bytes, fPort) {
  return AdeunisRF_Temp_Payload.decodeUp(fPort,bytes);
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
  