// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object with sensors values or a object with an error

var REPORT_PORT=1;
var BUTTON_PORT=7;

var REPORT_P_PORT=2;
var BUTTON_P_PORT=8;
var MOTION_P_PORT=10;

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
        battery_level: bytes[4] // in %
      };
    } else {
      {error: "BAD_SIZE"};
    }
  } else if((fPort===BUTTON_P_PORT || fPort===MOTION_P_PORT || fPort===REPORT_P_PORT)){
    if(bytes.length === 6) {
          return {
            button: (fPort===BUTTON_P_PORT),
           	motion: (fPort===MOTION_P_PORT),
            battery_level: bytes[0], // in %
            humidity:  bytes[1], // in %
            temperature: readInt16LE(bytes,2)/10.0, // in C°
            pressure: readInt16LE(bytes,4) // in hPa
          };
      } else {
        {error: "BAD_SIZE"};
      }
  } else {
	   return {error: "UNKNOWN_PORT"};
  }
}
