//*****************************************************************************
// Javascript codec functions for Sensing Labs endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************
function readUInt16BE(buf, offset) {
    offset = offset >>> 0;
    return (buf[offset] << 8) | buf[offset + 1];
}

function readInt8(buf, offset) {
    offset = offset >>> 0;
    if (!(buf[offset] & 0x80)) return (buf[offset]);
    return ((0xff - buf[offset] + 1) * -1);
}

function readUInt8 (buf, offset) {
    offset = offset >>> 0;
    return (buf[offset]);
  }
  
SensingLabs_SenlabH_Payload = {
    'decodeUp': function (port, payload) {
        // TODO check port

        // port is 3

        var value = {};

        var len = payload.length;

        //var _id = payload.readInt8(0);
        //value["id"] === 0x03;

        // the battery level expressed in 1/254 %
        var _battery = readUInt8(payload, 1);
        value["batteryLevel"] = ((_battery * (1 / 254.0)) * 100);

        // 	temperature expressed in 1/16 °C as a 2 bytes signed int
        var _temperature = readInt16BE(payload, len - 3);
        value["temperature"] = (_temperature * (1 / 16.0));


        //  humidity expressed in % as 8bits signed int [0-100%]
        var _humidity = readInt8(payload, len - 1);
        value["humidity"] = (_humidity);

        return value;
    },

    // encodes the given object into an array of bytes
    'encodeDn': function (port, value) {
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
    return SensingLabs_SenlabH_Payload.decodeUp(fPort, bytes);
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

