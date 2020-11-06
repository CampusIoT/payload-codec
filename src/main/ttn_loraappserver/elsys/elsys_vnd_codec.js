/*
  ______ _       _______     _______ 
 |  ____| |     / ____\ \   / / ____|
 | |__  | |    | (___  \ \_/ / (___  
 |  __| | |     \___ \  \   / \___ \ 
 | |____| |____ ____) |  | |  ____) |
 |______|______|_____/   |_| |_____/ 
 
  ELSYS simple payload decoder. 
  Use it as it is or remove the bugs :)
  www.elsys.se
  peter@elsys.se

  https://elsys.se/public/documents/Sensor_payload.pdf
  https://www.elsys.se/en/elsys-payload/

*/

// Extra data : dewpoint
// Added by Didier DONSEZ

// Constantes d'approximation
// Voir http://en.wikipedia.org/wiki/Dew_point pour plus de constantes
var a = 17.27;
var b = 237.7;

/** Fonction de calcul rapide du point de rosée en fonction de la température et de l'humidité ambiante */
function dewPoint(celsius, humidity) {
  // Calcul (approximation)
  var temp = (a * celsius) / (b + celsius) + Math.log(humidity * 0.01);
  return (b * temp) / (a - temp);
}

// ELSYS SETTINGS DECODER (Default fPort = 6)
// Added by Didier DONSEZ

var SETTINGS_HEADER = 0x3E;

function bool(a) {
	return a[0] ? "true" : "false";
}

function uint(a) {
	if(a.length == 1) return a[0];
	if(a.length == 2) return (a[0]<<8)|a[1];
	if(a.length == 4) return (a[0]<<24)|(a[1]<<16)|(a[2]<<8)|a[3];
  return a;
}

function extcfg(a) {
	var cfg = a[0];
  switch(cfg) {
  	case 1:
    	return "Analog";
  	case 2:
    	return "Pulse (pulldown)";
  	case 3:
    	return "Pulse (pullup)";
  	case 4:
    	return "Abs pulse (pulldown)";
  	case 5:
    	return "Abs pulse (pullup)";
  	case 6:
    	return "1-wire temp DS18B20";
  	case 7:
    	return "Switch NO";
  	case 8:
    	return "Switch NC";
  	case 9:
    	return "Digital";
  	case 10:
    	return "SRF-01";
  	case 11:
    	return "Decagon";
  	case 12:
    	return "Waterleak";
  	case 13:
    	return "Maxbotix ML738x";
  	case 14:
    	return "GPS";
  	case 15:
    	return "1-wire temp + Switch NO";
  	case 16:
    	return "Analog 0-3V";
  	case 17:
    	return "ADC module (pt1000)";
  }
  return a;
}

function sensor(a) {
    var t = a[0];
    switch(t) {
        case 0:
            return "Unknown";
        case 1:
            return "ESM5k";
        case 10:
            return "ELT1";
        case 11:
            return "ELT1HP";
        case 12:
            return "ELT2HP";
        case 13:
            return "ELT Lite";
        case 20:
            return "ERS";
        case 21:
            return "ERS CO2";
        case 22:
            return "ERS Lite";
        case 23:
            return "ERS Eye";
        case 24:
            return "ERS Desk";
        case 25:
            return "ERS Sound";
        case 30:
            return "EMS";

    }
    return a;
}

var settings = [
  {size: 16, type: 1, name: 'AppSKey', hex:true, parse: null},
  {size: 16, type: 2, name: 'NwkSKey', hex:true, parse: null},
  {size: 16, type: 4, name: 'AppEui', hex:true, parse: null},
  {size: 4, type: 6, name: 'DevAddr', hex:true, parse: null},

  {size: 1, type: 7, name: 'OTA', parse: bool},
  {size: 1, type: 8, name: 'Port', parse: uint},
  {size: 1, type: 9, name: 'Mode', parse: uint},
  {size: 1, type: 10, name: 'ACK', parse: bool},
  {size: 1, type: 11, name: 'DrDef', parse: uint},
  {size: 1, type: 13, name: 'DrMin', parse: uint},
  {size: 1, type: 12, name: 'DrMax', parse: uint},

  {size: 1, type: 16, name: 'ExtCfg', parse: extcfg},
  {size: 1, type: 17, name: 'PirCfg', parse: uint},
  {size: 1, type: 18, name: 'Co2Cfg', parse: uint},
  {size: 4, type: 19, name: 'AccCfg', parse: null},
  {size: 4, type: 20, name: 'SplPer', parse: uint},
  {size: 4, type: 21, name: 'TempPer', parse: uint},
  {size: 4, type: 22, name: 'RhPer', parse: uint},
  {size: 4, type: 23, name: 'LightPer', parse: uint},
  {size: 4, type: 24, name: 'PirPer', parse: uint},
  {size: 4, type: 25, name: 'Co2Per', parse: uint},
  {size: 4, type: 26, name: 'ExtPer', parse: uint},
  {size: 4, type: 27, name: 'ExtPwrTime', parse: uint},
  {size: 4, type: 28, name: 'TriggTime', parse: uint},
  {size: 4, type: 29, name: 'AccPer', parse: uint},
  {size: 4, type: 30, name: 'VddPer', parse: uint},
  {size: 4, type: 31, name: 'SendPer', parse: uint},
  {size: 4, type: 32, name: 'Lock', parse: uint},
  {size: 4, type: 34, name: 'Link', parse: null},
  {size: 4, type: 33, name: 'KeyWdg', parse: uint},
  {size: 4, type: 35, name: 'PressPer', parse: uint},
  {size: 4, type: 36, name: 'SoundPer', parse: uint},
  {size: 1, type: 37, name: 'Plan', parse: uint},
  {size: 1, type: 38, name: 'SubBand', parse: uint},
  {size: 1, type: 39, name: 'LBT', parse: bool},
  {size: 1, type: 40, name: 'LedConfig', parse: uint},
  {size: 4, type: 42, name: 'WaterPer', parse: uint},
  {size: 4, type: 43, name: 'ReedPer', parse: uint},
  {size: 4, type: 44, name: 'ReedCfg', parse: uint},
  {size: 1, type: 245, name: 'Sensor', parse: sensor},
  {size: 1, type: 250, name: 'External', parse: null},
  {size: 2, type: 251, name: 'Version', parse: uint},
  {size: 4, type: 252, name: 'Sleep', parse: null},
  //{size: 0, type: 253, name: 'Generic', parse: null},
  {size: 0, type: 254, name: 'Reboot', parse: null}
];

function DecodeElsysSettings(bytes) {

  var payload = {};

  var i = 0;
  if(bytes[i++] != SETTINGS_HEADER) {
  	return makeError("incorrect header");
  }
  var size = bytes[i++];
  while (i < bytes.length) {
    var type = bytes[i++];

    var setting = settings.filter(function(s) { return s.type == type; });
    if(setting.length == 0) {
    	return makeError("unknown setting type; " + type + " at offset " + i);
    }
    setting = setting[0];
    var d = bytes.slice(i, i+setting.size);
    if(setting.parse == null) {
    	payload[setting.name] = d;
    } else {
    	payload[setting.name] = setting.parse(d);
    }
    i += setting.size;
  }

  return {
    "settings": payload 
  };
}

function makeError(desc) {
  return {
    "error": desc
  };
}

// ELSYS DATA DECODER (Default fPort = 5)

var TYPE_TEMP = 0x01; //temp 2 bytes -3276.8°C -->3276.7°C
var TYPE_RH = 0x02; //Humidity 1 byte  0-100%
var TYPE_ACC = 0x03; //acceleration 3 bytes X,Y,Z -128 --> 127 +/-63=1G
var TYPE_LIGHT = 0x04; //Light 2 bytes 0-->65535 Lux
var TYPE_MOTION = 0x05; //No of motion 1 byte  0-255
var TYPE_CO2 = 0x06; //Co2 2 bytes 0-65535 ppm 
var TYPE_VDD = 0x07; //VDD 2byte 0-65535mV
var TYPE_ANALOG1 = 0x08; //VDD 2byte 0-65535mV
var TYPE_GPS = 0x09; //3bytes lat 3bytes long binary
var TYPE_PULSE1 = 0x0A; //2bytes relative pulse count
var TYPE_PULSE1_ABS = 0x0B;  //4bytes no 0->0xFFFFFFFF
var TYPE_EXT_TEMP1 = 0x0C;  //2bytes -3276.5C-->3276.5C
var TYPE_EXT_DIGITAL = 0x0D;  //1bytes value 1 or 0
var TYPE_EXT_DISTANCE = 0x0E;  //2bytes distance in mm
var TYPE_ACC_MOTION = 0x0F;  //1byte number of vibration/motion
var TYPE_IR_TEMP = 0x10;  //2bytes internal temp 2bytes external temp -3276.5C-->3276.5C
var TYPE_OCCUPANCY = 0x11;  //1byte data
var TYPE_WATERLEAK = 0x12;  //1byte data 0-255 
var TYPE_GRIDEYE = 0x13;  //65byte temperature data 1byte ref+64byte external temp
var TYPE_PRESSURE = 0x14;  //4byte pressure data (hPa)
var TYPE_SOUND = 0x15;  //2byte sound data (peak/avg)
var TYPE_PULSE2 = 0x16;  //2bytes 0-->0xFFFF
var TYPE_PULSE2_ABS = 0x17;  //4bytes no 0->0xFFFFFFFF
var TYPE_ANALOG2 = 0x18;  //2bytes voltage in mV
var TYPE_EXT_TEMP2 = 0x19;  //2bytes -3276.5C-->3276.5C
var TYPE_EXT_DIGITAL2 = 0x1A;  // 1bytes value 1 or 0 
var TYPE_EXT_ANALOG_UV = 0x1B; // 4 bytes signed int (uV)
var TYPE_DEBUG = 0x3D;  // 4bytes debug 

// Sensor settings sent to server at startup (First package). Sent on Port+1. See sensor settings document for more information.
var TYPE_SETTINGS = SETTINGS_HEADER;  // nbytes debug 



function bin16dec(bin) {
    var num = bin & 0xFFFF;
    if (0x8000 & num)
        num = - (0x010000 - num);
    return num;
}
function bin8dec(bin) {
    var num = bin & 0xFF;
    if (0x80 & num)
        num = - (0x0100 - num);
    return num;
}
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
function DecodeElsysPayload(data) {
    var obj = new Object();
    for (i = 0; i < data.length; i++) {
        //console.log(data[i]);
        switch (data[i]) {
            case TYPE_TEMP: //Temperature
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.temperature = temp / 10;
                i += 2;
                break
            case TYPE_RH: //Humidity
                var rh = (data[i + 1]);
                obj.humidity = rh;
                i += 1;
                break
            case TYPE_ACC: //Acceleration
                obj.x = bin8dec(data[i + 1]);
                obj.y = bin8dec(data[i + 2]);
                obj.z = bin8dec(data[i + 3]);
                i += 3;
                break
            case TYPE_LIGHT: //Light
                obj.light = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_MOTION: //Motion sensor(PIR)
                obj.motion = (data[i + 1]);
                i += 1;
                break
            case TYPE_CO2: //CO2
                obj.co2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_VDD: //Battery level
                obj.vdd = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_ANALOG1: //Analog input 1
                obj.analog1 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_GPS: //gps
                obj.lat = (data[i + 1] << 16) | (data[i + 2] << 8) | (data[i + 3]);
                obj.long = (data[i + 4] << 16) | (data[i + 5] << 8) | (data[i + 6]);
                i += 6;
                break
            case TYPE_PULSE1: //Pulse input 1
                obj.pulse1 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_PULSE1_ABS: //Pulse input 1 absolute value
                var pulseAbs = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                obj.pulseAbs = pulseAbs;
                i += 4;
                break
            case TYPE_EXT_TEMP1: //External temp
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.externalTemperature = temp / 10;
                i += 2;
                break
            case TYPE_EXT_DIGITAL: //Digital input
                obj.digital = (data[i + 1]);
                i += 1;
                break
            case TYPE_EXT_DISTANCE: //Distance sensor input 
                obj.distance = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_ACC_MOTION: //Acc motion
                obj.accMotion = (data[i + 1]);
                i += 1;
                break
            case TYPE_IR_TEMP: //IR temperature
                var iTemp = (data[i + 1] << 8) | (data[i + 2]);
                iTemp = bin16dec(iTemp);
                var eTemp = (data[i + 3] << 8) | (data[i + 4]);
                eTemp = bin16dec(eTemp);
                obj.irInternalTemperature = iTemp / 10;
                obj.irExternalTemperature = eTemp / 10;
                i += 4;
                break
            case TYPE_OCCUPANCY: //Body occupancy
                obj.occupancy = (data[i + 1]);
                i += 1;
                break
            case TYPE_WATERLEAK: //Water leak
                obj.waterleak = (data[i + 1]);
                i += 1;
                break
            case TYPE_GRIDEYE: //Grideye data
                i += 65;
                break
            case TYPE_PRESSURE: //External Pressure
                var temp = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                obj.pressure = temp / 1000;
                i += 4;
                break
            case TYPE_SOUND: //Sound
                obj.soundPeak = data[i + 1];
                obj.soundAvg = data[i + 2];
                i += 2;
                break
            case TYPE_PULSE2: //Pulse 2
                obj.pulse2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_PULSE2_ABS: //Pulse input 2 absolute value
                obj.pulseAbs2 = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break
            case TYPE_ANALOG2: //Analog input 2
                obj.analog2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break
            case TYPE_EXT_TEMP2: //External temp 2
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.externalTemperature2 = temp / 10;
                i += 2;
                break
            case TYPE_EXT_DIGITAL2: //Digital input 2 
                obj.digital2 = (data[i + 1]);
                i += 1;
                break
            case TYPE_EXT_ANALOG_UV: //Load cell analog uV
                obj.analogUv = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break

            case TYPE_SETTINGS: //Sensor settings
                return DecodeElsysSettings(data);

            default: //somthing is wrong with data
                i = data.length;
                break
        }
    }

    if(obj.temperature && obj.humidity) {
        obj.dewpoint = dewPoint(obj.temperature, obj.humidity);
    }

    return obj;
}

// For TTN
// Decode decodes an array of bytes into an object.
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - fPort contains the LoRaWAN fPort number
// The function must return an object, e.g. {"temperature": 22.5}
function Decoder(bytes, fPort) {
    return DecodeElsysPayload(bytes);
}

// For Chripstack
// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
    return Decoder(bytes, fPort)
}

  //module.exports.Decoder = Decoder;
  //module.exports.Decode = Decode;
