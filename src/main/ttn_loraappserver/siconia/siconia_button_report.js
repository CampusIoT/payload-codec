// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object with sensors values or a object with an error

var REPORT_PORT=1;
var BUTTON_PORT=7;

function readInt16LE (buf, offset) {
  offset = offset >>> 0
  var val = buf[offset] | (buf[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val;
}

function Decode(fPort, bytes) {
  if((fPort===BUTTON_PORT || fPort===REPORT_PORT)){
    if(bytes.length === 5) {
      return {
        button: (fPort===BUTTON_PORT),
        temperature: bytes[0], // in C°
        humidity: bytes[1], // in %
        pressure: readInt16LE(bytes,2), // in hPa
        battery_level: bytes[4], // in %
      };
    } else {
      {error: "BAD_SIZE"};
    }
  } else {
	   return {error: "UNKNOWN_PORT"};
  }
}
