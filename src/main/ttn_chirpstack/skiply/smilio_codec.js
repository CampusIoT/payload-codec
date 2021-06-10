// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object with sensors values or a object with an error

// Author: Didier DONSEZ, 2020

var KEEPALIVE=1;
var NORMAL=2;
var ACK=3;

function readUInt16BE (buf, offset) {
  offset = offset >>> 0;
  return (buf[offset] << 8) | buf[offset + 1];
}

// For chirpstack.io
function Decode(fPort, bytes) {

  if(bytes.length < 1) {
    return {type:"unknown"};
  }
  var type = bytes[0];

  if((type === NORMAL || type === ACK) && bytes.length === (1+5*2)) {
      return {
        type: (type===NORMAL) ? "normal" : "ack",
        but1: readUInt16BE(bytes,1),
        but2: readUInt16BE(bytes,3),
        but3: readUInt16BE(bytes,5),
        but4: readUInt16BE(bytes,7),
        but5: readUInt16BE(bytes,9)
      };
  } else if(type === KEEPALIVE && bytes.length === (1+2*2+1)) {
      return {
        type: "keepalive",
        batteryIdle: readUInt16BE(bytes,1),
        batteryTx: readUInt16BE(bytes,3)
      };
  } else {
	   return {type:"unknown"};
  }
}

// For TTN
function Decoder(bytes, fPort) {
  return Decode(fPort, bytes);
}
