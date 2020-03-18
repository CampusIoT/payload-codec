//*****************************************************************************
// Javascript codec functions for Tekelek TEK766 endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

function readUInt16BE (buf, offset) {
  offset = offset >>> 0
  return (buf[offset] << 8) | buf[offset + 1]
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

// Default value
const TX_PERIOD = 6*60*60; // in sceonds


// Ports
const PORT_SONIC_MEASUREMENT = 0x10;
const PORT_STATUS = 0x30;
const PORT_ALARM_NOTOFICATION = 0x45;

Tekelec_Tek766_Payload = {

    'decodeUp': function (port,payload) {
    	// TODO check port
    	var p = payload;

	    if ( port===PORT_SONIC_MEASUREMENT && p.length === 20) {

	    	var value = {};

        value["type"]="measurement";
        //var type=readUInt8(p,0); // same as the port

        var prodId=readUInt8(p,1);
        value["prodId"]=prodId;

        var alarms=readUInt8(p,2);

        value["alarm0"]=alarms & 0x01;
        value["alarm1"]=alarms & 0x02;
        value["alarm2"]=alarms & 0x04;

        // var reserved = readUInt8(p,3);

        var ullage0=readUInt16BE(p,4);
        var temp0=readInt8(p,6);
        var sonicrssi0=readUInt8(p,7) >> 4;
        var sonicsrc0=readUInt8(p,7) & 0x0F;
        value["ullage0"]=ullage0;
        value["temperature0"]=temp0;
        value["sonicrssi0"]=sonicrssi0;
        value["sonicsrc0"]=sonicsrc0;

        var ullage1=readUInt16BE(p,8);
        var temp1=readInt8(p,10);
        var sonicrssi1=readUInt8(p,11) >> 4;
        var sonicsrc1=readUInt8(p,11) & 0x0F;
        value["ullage1"]=ullage1;
        value["temperature1"]=temp1;
        value["sonicrssi1"]=sonicrssi1;
        value["sonicsrc1"]=sonicsrc1;


        var ullage2=readUInt16BE(p,12);
        var temp2=readInt8(p,14);
        var sonicrssi2=readUInt8(p,15) >> 4;
        var sonicsrc2=readUInt8(p,15) & 0x0F;
        value["ullage2"]=ullage2;
        value["temperature2"]=temp2;
        value["sonicrssi2"]=sonicrssi2;
        value["sonicsrc2"]=sonicsrc2;

        var ullage3=readUInt16BE(p,16);
        var temp3=readInt8(p,18);
        var sonicrssi3=readUInt8(p,19) >> 4;
        var sonicsrc3=readUInt8(p,19) & 0x0F;
        value["ullage3"]=ullage3;
        value["temperature3"]=temp3;
        value["sonicrssi3"]=sonicrssi3;
        value["sonicsrc3"]=sonicsrc3;


        value.series = [];
        value.series.push ({
          _timeShift: 0,
          alarm0: value.alarm0,
          alarm1: value.alarm1,
          alarm2: value.alarm2,
          ullage: value.ullage0,
          temperature: value.temperature0,
          sonicrssi: value.sonicrssi0,
          sonicsrc: value.sonicsrc0
        });
        value.series.push ({
          _timeShift: -TX_PERIOD, // 6 hours ago (in seconds)
          ullage: value.ullage1,
          temperature: value.temperature1,
          sonicrssi: value.sonicrssi1,
          sonicsrc: value.sonicsrc1
        });
        value.series.push ({
          _timeShift: -2*TX_PERIOD , // 12 hours ago (in seconds)
          ullage: value.ullage2,
          temperature: value.temperature2,
          sonicrssi: value.sonicrssi2,
          sonicsrc: value.sonicsrc2
        });
        value.series.push ({
          _timeShift: -3*TX_PERIOD , // 18 hours ago (in seconds)
          ullage: value.ullage3,
          temperature: value.temperature3,
          sonicrssi: value.sonicrssi3,
          sonicsrc: value.sonicsrc3
        });

	    	return value;

	    } else if (port===PORT_STATUS && p.length === 18) {
        // console.log(port, p.length, p.toString('hex'));

        var value = {};

        value["type"]="status";

        var prodId=readUInt8(p,1);
        value["prodId"]=prodId;

        var hwId=readUInt8(p,4);
        value["hwId"]=hwId;

        var swId=readUInt16BE(p,5);
        value["swId"]=hwId;

        var rssi=readUInt8(p,8);
        value["rssi"]=-rssi;

        var battery=readUInt8(p,10);
        value["batteryLevel"]=battery;

        var measurementSteps=readUInt16BE(p,11);
        value["measurementSteps"]=measurementSteps;

        var txPeriod=readUInt8(p,13);
        value["txPeriod"]=txPeriod;

        var ullage=readUInt16BE(p,14);
        value["ullage"]=ullage;

        var temperature=readInt8(p,16);
        value["temperature"]=temperature;

        var sonicrssi=readUInt8(p,17) >> 4;
        var sonicsrc=readUInt8(p,17) & 0x0F;
        value["sonicrssi"]=sonicrssi;
        value["sonicsrc"]=sonicsrc;

        return value;

      } else if (port===PORT_ALARM_NOTOFICATION && p.length === 12) {
        // console.log(port, p.length, p.toString('hex'));

        var value = {};

        value["type"]="alarm";

        //var type=readUInt8(p,0); // same as the port

        var prodId=readUInt8(p,1);
        value["prodId"]=prodId;

        var alarms=readUInt8(p,2);

        value["alarm0"]=alarms & 0x01;
        value["alarm1"]=alarms & 0x02;
        value["alarm2"]=alarms & 0x04;

        // var reserved = readUInt8(p,3);

        var ullage=readUInt16BE(p,4);
        var temperature=readInt8(p,6);
        var sonicrssi=readUInt8(p,7) >> 4;
        var sonicsrc=readUInt8(p,7) & 0x0F;
        value["ullage"]=ullage;
        value["temperature"]=temperature;
        value["sonicrssi"]=sonicrssi;
        value["sonicsrc"]=sonicsrc;

        value.series = [];
        value.series.push ({
          _timeShift: 0,
          alarm0: value.alarm0,
          alarm1: value.alarm1,
          alarm2: value.alarm2,
          ullage: value.ullage,
          temperature: value.temperature,
          sonicrssi: value.sonicrssi,
          sonicsrc: value.sonicsrc
        });
        return value;

	    } else {
        // console.log(port, p.length, p.toString('hex'));
	    	return undefined;
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
  return Tekelec_Tek766_Payload.decodeUp(fPort,bytes);
}

// For LoRaServer.io
// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
  return Decoder(bytes, fPort)
}

//module.exports.Decoder = Decoder;
//module.exports.Decode = Decode;
