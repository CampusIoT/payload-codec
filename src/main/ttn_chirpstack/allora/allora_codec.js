//*****************************************************************************
// Javascript codec functions for Allora Pirio endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

/*
First we have 2 fixed bytes (length and allora message type). Next we have a
sequence of Key-Value pairs. Not all Key-Value pairs are always transmitted in
each message, so be flexible when you parse the payload.
Fixed:
Name # bytes Description
Length 1 byte Number of bytes in the payload after this length byte
(length not included in the value)
Min. 0x00, Max 0xFF (max depends on LoRaWAN
maximum payload settings)
Message
type 1 byte Message type of the payload.
0x02: report message
0xFF: error message
*/

function readInt8 (buf, offset) {
    offset = offset >>> 0;
    if (!(buf[offset] & 0x80)) return (buf[offset]);
    return ((0xff - buf[offset] + 1) * -1);
  }
  
  function readUInt8 (buf, offset) {
    offset = offset >>> 0;
    return (buf[offset]);
  }
  
  function readUInt16BE (buf, offset) {
    offset = offset >>> 0;
    return (buf[offset] << 8) | buf[offset + 1];
  }
  
  function readInt16BE (buf, offset) {
    offset = offset >>> 0;
    var val = buf[offset + 1] | (buf[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  }
  
  var a = 17.27;
  var b = 237.7;
  
  function dewPoint(celsius, humidity) {
    var temp = (a * celsius) / (b + celsius) + Math.log(humidity * 0.01);
    return (b * temp) / (a - temp);
  }
  
  Allora_Payload = {
    'decodeUp': function (port,payload) {
  
  
          var BATTERY_SHUTDOWN_LEVEL = 1900; // mV
          var BATTERY_MIN_LEVEL = 2000; // mV
          var BATTERY_MAX_LEVEL = 3300; // mV
  
          var MSGTYPE_REPORT = 0x02;
          var MSGTYPE_ERROR = 0xFF;
  
          var TYPE_TEMPERATURE = 0x01;
          var TYPE_HUMIDITY = 0x02;
          var TYPE_OCCUPANCY = 0x04;
          var TYPE_NUM_OCCUPIED_BLOCKS = 0x05;
          var TYPE_NUM_MOTION_EVTS = 0x06;
          var TYPE_NUM_FREE_BLOCKS = 0x07;
          var TYPE_RAW_MOTION_EVTS = 0x08;
          var TYPE_BATTERY_LEVEL = 0xFE;
          var TYPE_ERROR = 0xFF;
  
      var value = {}
      var p = payload;
      var idx = 0;
      var len = readUInt8(p,idx);
      idx += 1;
      var msgType = readUInt8(p,idx);
      idx += 1;
  
      if(msgType === MSGTYPE_ERROR) {
          value.error = true;
          return value;
      } else if(msgType !== MSGTYPE_REPORT) {
          value.unknown_msg = true;
          return value;
      }
  
      var v;
      while(idx < payload.length)
      {
          var dataType = payload[idx++];
          //console.log(idx, "-->", dataType);
          switch(dataType) {
              case TYPE_TEMPERATURE:
                  v = readInt16BE(payload,idx) / 100.0;
                  idx += 2;
                  value.temperature = v;
                  break;
              case TYPE_HUMIDITY:
                  v = (readUInt16BE(payload,idx) / 65536)*125 - 6;
                  idx += 2;
                  value.humidity = v;
                  break;
              case TYPE_OCCUPANCY:
                  // 0x00 Monitored space is free
                  // 0x01 Monitored space is occupied
                  v = readUInt8(payload,idx) !== 0 ? true : false;
                  idx += 1;
                  value.occupancy = v;
                  break;
              case TYPE_NUM_OCCUPIED_BLOCKS:
                  v = readUInt8(payload,idx);
                  idx += 1;
                  value.num_occupied_blocks = v;
                  break;
              case TYPE_NUM_MOTION_EVTS:
                  v = readUInt16BE(payload,idx);
                  idx += 2;
                  value.num_motion_events = v;
                  break;
              case TYPE_NUM_FREE_BLOCKS:
                  v = readUInt8(payload,idx);
                  idx += 1;
                  value.num_free_blocks = v;
                  break;
              case TYPE_RAW_MOTION_EVTS:
                  v = readUInt8(payload,idx);
                  idx += 1;
                  value.num_motion_events = v;
                  break;
              case TYPE_BATTERY_LEVEL:
                  v = readUInt8(payload,idx);
                  idx += 1;
                  if(v === 0) {
                      value.battery_level = 0;
                      value.battery_voltage = BATTERY_SHUTDOWN_LEVEL;
                  } else if(v === 1) {
                      value.battery_level = 1;
                      value.battery_voltage = (BATTERY_SHUTDOWN_LEVEL + BATTERY_MIN_LEVEL) / 2;
                  }  else if(v === 254) {
                      value.battery_level = 100;
                      value.battery_voltage = BATTERY_MAX_LEVEL;
                  } else if(v === 255) {
                      value.battery_level = 0;
                      value.battery_voltage = BATTERY_SHUTDOWN_LEVEL;
                  } else {
                      value.battery_level = ( ( 253 * ( v - BATTERY_MIN_LEVEL ) ) / ( BATTERY_MAX_LEVEL - BATTERY_MIN_LEVEL ) ) + 1;
                      value.battery_voltage = value.battery_level * (BATTERY_MAX_LEVEL-BATTERY_MIN_LEVEL) + BATTERY_MIN_LEVEL;
                  }
                  /*
                  Type: uint8
                  Value:
                  0x00 - 0xFF
                  255: battery voltage < BATTERY_SHUTDOWN_LEVEL (1900 mV)
                  254 : battery voltage >= BATTERY_MAX_LEVEL (3300 mV)
                  253 - 2: batteryLevel = ( ( 253 * ( BatteryVoltage - BATTERY_MIN_LEVEL ) ) / ( BATTERY_MAX_LEVEL - BATTERY_MIN_LEVEL ) ) + 1;
                  1 : battery voltage between BATTERY_MIN_LEVEL (2000 mV) and BATTERY_SHUTDOWN_LEVEL (1900 mV).
                  0 : battery voltage < 1.9V
                  */
                  break;
              default:
                  return value;
          }
      }
      
      if(value.humidity && value.temperature) {
        value.dewpoint = dewPoint(value.temperature, value.humidity);
      }
      
      return value;
    }
  }
  
  // For TTN and Helium
  // Decode decodes an array of bytes into an object.
  //  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
  //  - fPort contains the LoRaWAN fPort number
  // The function must return an object, e.g. {"temperature": 22.5}
  function Decoder(bytes, fPort) {
    return Allora_Payload.decodeUp(fPort,bytes);
  }
  
  // For Chirpstack
  // Decode decodes an array of bytes into an object.
  //  - fPort contains the LoRaWAN fPort number
  //  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
  // The function must return an object, e.g. {"temperature": 22.5}
  function Decode(fPort, bytes) {
    return Decoder(bytes, fPort)
  }
  