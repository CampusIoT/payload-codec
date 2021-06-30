//
// LGT92-v1.6.4_decoder_TTN
// 

function Decoder(bytes, port) {

    var o = {};
  // Decode an uplink message from a buffer

  // (array) of bytes to an object of fields.

  //gps latitude,units: Â°
  o.latitude = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) / 1000000;//gps latitude,units: Â°
  o.longitude = (bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7]) / 1000000;//gps longitude,units: Â°
  o.altitude = (bytes[16] << 24 >> 16 | bytes[17]) / 100; //Altitude,units: Â°

    //Alarm status
  o.alarm = (bytes[8] & 0x40) ? 1 : 0;

    //Battery,units:mV
  o.battery = (((bytes[8] & 0x3f) << 8) | bytes[9]);

  //mode of motion
  if ((bytes[10] & 0xC0) == 0x40) {
        o.motion_move = 1;
  } else if ((bytes[10] & 0xC0) == 0x80) {
        o.motion_collide = 1;
  } else if ((bytes[10] & 0xC0) == 0xC0) {
        o.motion_user = 1;
  } else {
        o.motion_disable = 1;
  }

  // LED status for position,uplink and downlink
  o.led_updown = (bytes[10] & 0x20) ? 1 : 0;

  o.firmware = 160 + (bytes[10] & 0x1f);  // Firmware version; 5 bits 

  o.roll = (bytes[11] << 24 >> 16 | bytes[12]) / 100;//roll,units: Â°
  o.pitch = (bytes[13] << 24 >> 16 | bytes[14]) / 100; //pitch,units: Â°

  if (bytes[15] > 0) {
      o.hdop = bytes[15] / 100; //hdop,units: Â°
  } else {
      o.hdop = bytes[15];
  }

  return o;
}

// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes, variables) {
return Decoder(bytes, fPort);
}
