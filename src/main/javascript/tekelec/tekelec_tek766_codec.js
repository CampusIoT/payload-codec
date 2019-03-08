//*****************************************************************************
// Javascript codec functions for Tekelec TEK766 endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

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
        //var type=p.readUInt8(0); // same as the port

        var prodId=p.readUInt8(1);
        value["prodId"]=prodId;

        var alarms=p.readUInt8(2);

        value["alarm0"]=alarms & 0x01;
        value["alarm1"]=alarms & 0x02;
        value["alarm2"]=alarms & 0x04;

        // var reserved = p.readUInt8(3);

        var ullage0=p.readUInt16BE(4);
        var temp0=p.readInt8(6);
        var sonicrssi0=p.readUInt8(7) >> 4;
        var sonicsrc0=p.readUInt8(7) & 0x0F;
        value["ullage0"]=ullage0;
        value["temperature0"]=temp0;
        value["sonicrssi0"]=sonicrssi0;
        value["sonicsrc0"]=sonicsrc0;

        var ullage1=p.readUInt16BE(8);
        var temp1=p.readInt8(10);
        var sonicrssi1=p.readUInt8(11) >> 4;
        var sonicsrc1=p.readUInt8(11) & 0x0F;
        value["ullage1"]=ullage1;
        value["temperature1"]=temp1;
        value["sonicrssi1"]=sonicrssi1;
        value["sonicsrc1"]=sonicsrc1;


        var ullage2=p.readUInt16BE(12);
        var temp2=p.readInt8(14);
        var sonicrssi2=p.readUInt8(15) >> 4;
        var sonicsrc2=p.readUInt8(15) & 0x0F;
        value["ullage2"]=ullage2;
        value["temperature2"]=temp2;
        value["sonicrssi2"]=sonicrssi2;
        value["sonicsrc2"]=sonicsrc2;

	    	return value;

	    } else if (port===PORT_STATUS && p.length === 18) {
        // console.log(port, p.length, p.toString('hex'));

        var value = {};

        value["type"]="status";

        var prodId=p.readUInt8(1);
        value["prodId"]=prodId;

        var hwId=p.readUInt8(4);
        value["hwId"]=hwId;

        var swId=p.readUInt16BE(5);
        value["swId"]=hwId;

        var rssi=p.readUInt8(8);
        value["rssi"]=-rssi;

        var battery=p.readUInt8(10);
        value["batteryLevel"]=battery;

        var measurementSteps=p.readUInt16BE(11);
        value["measurementSteps"]=measurementSteps;

        var txPeriod=p.readUInt8(13);
        value["txPeriod"]=txPeriod;

        var ullage=p.readUInt16BE(14);
        value["ullage"]=ullage;

        var temperature=p.readInt8(16);
        value["temperature"]=temperature;

        var sonicrssi=p.readUInt8(17) >> 4;
        var sonicsrc=p.readUInt8(17) & 0x0F;
        value["sonicrssi"]=sonicrssi;
        value["sonicsrc"]=sonicsrc;

        return value;

      } else if (port===PORT_ALARM_NOTOFICATION && p.length === 12) {
        // console.log(port, p.length, p.toString('hex'));

        var value = {};

        value["type"]="alarm";

        //var type=p.readUInt8(0); // same as the port

        var prodId=p.readUInt8(1);
        value["prodId"]=prodId;

        var alarms=p.readUInt8(2);

        value["alarm0"]=alarms & 0x01;
        value["alarm1"]=alarms & 0x02;
        value["alarm2"]=alarms & 0x04;

        // var reserved = p.readUInt8(3);

        var ullage=p.readUInt16BE(4);
        var temp=p.readInt8(6);
        var sonicrssi=p.readUInt8(7) >> 4;
        var sonicsrc=p.readUInt8(7) & 0x0F;
        value["ullage"]=ullage;
        value["temperature"]=temp;
        value["sonicrssi"]=sonicrssi;
        value["sonicsrc"]=sonicsrc;

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

module.exports.Decoder = Tekelec_Tek766_Payload;
