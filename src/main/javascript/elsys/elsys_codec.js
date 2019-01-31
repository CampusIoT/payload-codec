//*****************************************************************************
// Javascript codec functions for Elsys endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

/*
From https://www.elsys.se/en/wp-content/uploads/sites/3/2016/09/Elsys-LoRa-payload_v8.pdf

1 0x01 Temperature 2 ‐3276.5°C‐‐>3276.5°C (Value of: 10010.0 °C)
2 0x02 Humidity 1 0‐100%
3 0x03 Acceleration/level 3 X,Y,Z ‐127‐127 (63=1G)
4 0x04 Light 2 0‐65535 Lux
5 0x05 Motion (PIR) 1 0‐255 (Number of motion)
6 0x06 Co2 2 0‐10000ppm
7 0x07 Battery 2 0‐65535mV
8 0x08 Analog1 2 0‐65535mV
9 0x09 GPS 6 3 bytes lat, 3 bytes long,binary
10 0x0A Pulse count 2 0‐65535
11 0x0B Pulse count ABS 4 Absolute value 0‐4294967295
12 0x0C External temp1 2 ‐3276.5C‐‐>3276.5C
13 0x0D External Digital/Button 1 0,1 (on/off, down/upp)
14 0x0E External distance 2 0‐65535mm
15 0x0F Motion (acceleration movements) 1 0‐255
16 0x10 External IR temperature 4 2bytes internal temp 2 bytes external, ‐3276.5C‐‐>3276.5C
17 0x11 Occupancy 1 0‐255 (0 ‐‐> no body,1‐‐>body,2‐‐> Body)
18 0x12 External water leak 1 0‐255
19 0x13 Grideye (room occupancy) 65 1byte ref,64byte pixel temp 8x8 (reserved for future use)
20 0x14 Pressure 4 Pressure data (hPa)
21 0x15 Sound 2 Sound data,1 byte peak/ 1byte avg (dB)
22 0x16 Pulse count 2 2 0‐65535
23 0x17 Pulse count 2 ABS 4 Absolute value 0‐4294967295
24 0x18 Analog2 2 0‐65535mV
25 0x19 External temp2 2 ‐3276.5C‐‐>3276.5 °C (Value of: 10010.0 °C)
61 0x3D Debug information 4 Data depends on debug information
62 0x3E Sensor settings n Sensor setting sent to server at startup (first package). Sent on Port+1. See sensor settings for more information.

*/

Elsys_Payload = {

  'decodeUp': function (port,payload) {

    const TYPE_TEMPERATURE = 0x01;
    const TYPE_HUMIDITY = 0x02;
    const TYPE_ACCELERATION = 0x03;
    const TYPE_LIGHT = 0x04;
    const TYPE_MOTION_PIR = 0x05;
    const TYPE_CO2_PPM = 0x06;
    const TYPE_BATTERY_MV = 0x07;
    const TYPE_ANALOG1 = 0x08;
    const TYPE_GPS = 0x09;
    const TYPE_PULSE = 0x0A;
    const TYPE_PULSEABS = 0x0B;
    const TYPE_TEMPERATURE_EXTERNAL = 0x0C;
    const TYPE_BUTTON_EXTERNAL = 0x0D;
    const TYPE_DISTANCE_EXTERNAL = 0x0E;
    const TYPE_MOTION_ACC = 0x0F;
    const TYPE_TEMPERATURE_IR_EXTERNAL = 0x10;
    const TYPE_OCCUPANCY = 0x11;
    const TYPE_WATER_LEAK_EXTERNAL = 0x12;
    const TYPE_OCCUPANCY_GRIDEYE = 0x13;
    const TYPE_PRESSURE = 0x14;
    const TYPE_SOUND = 0x15;
    const TYPE_PULSE2 = 0x16;
    const TYPE_PULSEABS2 = 0x17;
    const TYPE_ANALOG2 = 0x18;
    const TYPE_TEMPERATURE_EXTERNAL2 = 0x19;
    // TBC


    var value = {}
    var p = payload;
    var idx = 0;
    var v;
    while(idx < payload.length)
    {
        var dataType = payload[idx++];
        //console.log(idx, "-->", dataType);
        switch(dataType) {
            case TYPE_TEMPERATURE:
                v = payload.readInt16BE(idx) / 10.0;
                idx += 2;
                if(value.temperature) {
                    if(value.temperatures === undefined) {
                        value.temperatures = [];
                        value.temperatures.push(value.temperature);
                    }
                    value.temperatures.push(v);
                } else {
                    value.temperature = v;
                }
                break;
            case TYPE_HUMIDITY:
                v = payload.readUInt8(idx);
                idx += 1;
                if(value.humidity) {
                    if(value.humiditys === undefined) {
                        value.humiditys = [];
                        value.humiditys.push(value.humidity);
                    }
                    value.humiditys.push(v);
                } else {
                    value.humidity = v;
                }
                break;
            case TYPE_LIGHT:
                v = payload.readUInt16BE(idx);
                idx += 2;
                if(value.light) {
                    if(value.lights === undefined) {
                        value.lights = [];
                        value.lights.push(value.light);
                    }
                    value.lights.push(v);
                } else {
                    value.light = v;
                }
                break;
            case TYPE_MOTION_PIR:
                v = payload.readUInt8(idx);
                idx += 1;
                if(value.motion_pir) {
                    if(value.motion_pirs === undefined) {
                        value.motion_pirs = [];
                        value.motion_pirs.push(value.motion_pir);
                    }
                    value.motion_pirs.push(v);
                } else {
                    value.motion_pir = v;
                }
                break;
            case TYPE_ACCELERATION:
                var x = payload.readInt8(idx);
                var y = payload.readInt8(idx+1);
                var z = payload.readInt8(idx+2);
                v = [x,y,z];
                idx += 3;
                if(value.acceleration) {
                    if(value.accelerations === undefined) {
                        value.accelerations = [];
                        value.accelerations.push(value.acceleration);
                    }
                    value.accelerations.push(v);
                } else {
                    value.acceleration = v;
                }
                break;
            case TYPE_BATTERY_MV:
                v = payload.readInt16BE(idx);
                idx += 2;
                if(value.batteryVoltage) {
                    if(value.batteryVoltages === undefined) {
                        value.batteryVoltages = [];
                        value.batteryVoltages.push(value.batteryVoltage);
                    }
                    value.batteryVoltages.push(v);
                } else {
                    value.batteryVoltage = v;
                }
                break;
            case TYPE_CO2_PPM:
                  v = payload.readInt16BE(idx);
                  idx += 2;
                  if(value.co2ppm) {
                      if(value.co2ppms === undefined) {
                          value.co2ppms = [];
                          value.co2ppms.push(value.co2ppm);
                      }
                      value.co2ppms.push(v);
                  } else {
                      value.co2ppms = v;
                  }
                  break;
            case TYPE_PRESSURE:
                v = payload.readInt32BE(idx);
                idx += 4;
                 if(value.pressure) {
                    if(value.pressures === undefined) {
                        value.pressures = [];
                        value.pressures.push(value.pressure);
                    }
                    value.pressures.push(v);
                } else {
                    value.pressure = v;
                }
                break;
            case TYPE_TEMPERATURE_EXTERNAL:
                v = payload.readInt16BE(idx) / 10.0;
                idx += 2;
                if(value.temperature_external) {
                    if(value.temperature_externals === undefined) {
                        value.temperature_externals = [];
                        value.temperature_externals.push(value.temperature_external);
                    }
                    value.temperature_externals.push(v);
                } else {
                    value.temperature_external = v;
                }
                break;
            default:
                return value;
        }
    }
    return value;

  },

  'encodeDn': function (port,value) {
    // TO BE IMPLEMENTED
    return null;
  }
}

module.exports.Decoder = Elsys_Payload;
