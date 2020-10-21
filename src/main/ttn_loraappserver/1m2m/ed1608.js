// Payload decoder from 1M2M ED1608 Full endpoint
// Author: Didier DONSEZ 2016-2020

function readInt16BE(buf, offset) {
    offset = offset >>> 0
    var val = buf[offset + 1] | (buf[offset] << 8)
    return (val & 0x8000) ? val | 0xFFFF0000 : val
}

function readInt8(buf, offset) {
    offset = offset >>> 0;
    if (!(buf[offset] & 0x80)) return (buf[offset]);
    return ((0xff - buf[offset] + 1) * -1);
}

function readUInt8(buf, offset) {
    offset = offset >>> 0;
    return (buf[offset]);
}

// Message IDs
var MsgIDAlive = 0x00;
var MsgIDTracking = 0x01;
var MsgIDGenSens = 0x02;
var MsgIDRot = 0x03;
var MsgIDAlarm = 0x04;
var MsgID1WireT = 0x06;
var MsgIDRunning = 0x07;
var MsgIDVibrate = 0x08;
var MsgIDAnalog = 0x09;
var MsgIDReboot = 0x0E;

OneM2M_ED1608Full_Payload = {

    'getDegree': function (payload, pos, maxDeg) {
        // payload is a baffer containing 3 bytes (signed 24b integer) at position pos
        // maxDeg is 90 for latitude and 180 for longitude

        var val = payload[pos + 0] << 16 + payload[pos + 1] << 8 + payload[pos + 2]; // BE or LE
        res = (val / 10000.0);

        return res;
    },


    'decodeUp': function (port, payload) {

        //console.log("OneM2M_ED1608Full_Payload decodeUp", port,payload.toString('hex'));

        var value = {};

        // TODO check port

        // cf 4.1.1

        var p = payload;

        // check length : must be 12-byte long.
        var msgId = p[0];
        value["msgId"] = msgId;

        switch (msgId) {
            case MsgIDAlive:
                value["_sub"] = "alive";
                value["cmdack"] = readUInt8(payload, 3);
                value["gpsfixage"] = readUInt8(payload, 4); // bit 0..7 = Age of last GPS Fix in Minutes,
                var satcnthill = readUInt8(payload, 5);
                value["satcnthill"] = {
                    satinfix: satcnthill & 0x1F,
                    latitude: satcnthill & 0x20,
                    longitude: satcnthill & 0xC0,
                }; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26
                value["lati"] = OneM2M_ED1608Full_Payload.getDegree(p, 6);	// byte Lat[3]; // bit 0..23 = latitude bit 0..23
                value["long"] = OneM2M_ED1608Full_Payload.getDegree(p, 9); // byte Lat[3]; // bit 0..23 = latitude bit 0..23
                value["batteryLevel"] = readUInt8(payload, 12) * 100 / 255; 	// 0..255 == 2,5V…3.5V == 0%..100%			

                break;
            case MsgIDTracking:
                value["_sub"] = "tracking";
                var _type = readUInt8(payload, 1);
                value["type"] = (_type & 0x01) ? "start" : (_type & 0x02) ? "move" : (_type & 0x04) ? "stop" : (_type & 0x08) ? "vibr" : undefined;
                value["temperature"] = readInt16BE(payload, 3) / 100;  // in 0,01 degC
                value["gpsfixage"] = readUInt8(payload, 4); // bit 0..7 = Age of last GPS Fix in Minutes,
                var satcnthill = readUInt8(payload, 5);
                value["satcnthill"] = {
                    satinfix: satcnthill & 0x1F,
                    latitude: satcnthill & 0x20,
                    longitude: satcnthill & 0xC0,
                }; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26
                value["lati"] = OneM2M_ED1608Full_Payload.getDegree(p, 6);	// byte Lat[3]; // bit 0..23 = latitude bit 0..23
                value["long"] = OneM2M_ED1608Full_Payload.getDegree(p, 9); // byte Lat[3]; // bit 0..23 = latitude bit 0..23

                break;
            case MsgIDGenSens:
                value["_sub"] = "gensens";

                value["pressure"] = Math.round(((100000 + readInt16BE(payload, 2)) / 100)); 	// Air Pressure in mBar = ( MsgIDMsgIDBaromBar +100000 )/100)    should be converted in hPa.

                value["temperature"] = readInt16BE(payload, 4) / 100; 			// in 0,01 degC
                value["humidity"] = readUInt8(payload, 6); 					// Relative Humidity in %
                value["levelx"] = readInt8(payload, 7); 						// Inverse Sinus of Beam Level in Deg X-Direction -128 = -90 Degr .. +127 = +90 Degr
                value["levely"] = readInt8(payload, 8); 						// Inverse Sinus of Beam Level in Deg Y-Direction -128 = -90 Degr .. +127 = +90 Degr
                value["levelz"] = readInt8(payload, 9); 						// Inverse Sinus of Beam Level in Deg Z-Direction -128 = -90 Degr .. +127 = +90 Degr
                value["vibamp"] = readUInt8(payload, 10); 					// Amplitude of Vibration Detected
                value["vibfreq"] = readUInt8(payload, 11); 					// Approx. Frequency of Vibration Detected in Hz

                break;

            case MsgIDAlarm:
                value["_sub"] = "alarm";
                // TODO
                break;
            case MsgID1WireT:
                value["_sub"] = "1wiret";
                // TODO
                break;
            case MsgIDRunning:
                value["_sub"] = "running";
                // TODO
                break;
            case MsgIDVibrate:
                value["_sub"] = "vibrate";
                // TODO
                break;
            case MsgIDAnalog:
                value["_sub"] = "analog";
                // TODO
                break;
            case MsgIDReboot:
                value["_sub"] = "reboot";
                // TODO
                break;
            default:
                value["_sub"] = "unknown";
            // TODO
        }

        //console.log("OneM2M_ED1608Full_Payload decodeUp value:", value);

        return value;
    }
}

// For TTN
// Decode decodes an array of bytes into an object.
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - fPort contains the LoRaWAN fPort number
// The function must return an object, e.g. {"temperature": 22.5}
function Decoder(bytes, fPort) {
    return OneM2M_ED1608Full_Payload.decodeUp(fPort, bytes);
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
