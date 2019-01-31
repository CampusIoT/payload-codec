//*****************************************************************************
// Javascript codec functions for Adeunis Temp endpoints
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
Allora_Payload = {
  'decodeUp': function (port,payload) {


        const BATTERY_SHUTDOWN_LEVEL = 1900; // mV
        const BATTERY_MIN_LEVEL = 2000; // mV
        const BATTERY_MAX_LEVEL = 3300; // mV

        const MSGTYPE_REPORT = 0x02;
        const MSGTYPE_ERROR = 0xFF;

        const TYPE_TEMPERATURE = 0x01;
        const TYPE_HUMIDITY = 0x02;
        const TYPE_OCCUPANCY = 0x04;
        const TYPE_NUM_OCCUPIED_BLOCKS = 0x05;
        const TYPE_NUM_MOTION_EVTS = 0x06;
        const TYPE_NUM_FREE_BLOCKS = 0x07;
        const TYPE_RAW_MOTION_EVTS = 0x08;
        const TYPE_BATTERY_LEVEL = 0xFE;
        const TYPE_ERROR = 0xFF;

    var value = {}
    var p = payload;
    var idx = 0;
    var len = p.readUInt8(idx);
    idx += 1;
    var msgType = p.readUInt8(idx);
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
                v = payload.readInt16BE(idx) / 100.0;
                idx += 2;
                value.temperature = v;
                break;
            case TYPE_HUMIDITY:
                v = (payload.readUInt16BE(idx) / 65536)*125 - 6;
                idx += 2;
                value.humidity = v;
                break;
            case TYPE_OCCUPANCY:
                // 0x00 Monitored space is free
                // 0x01 Monitored space is occupied
                v = payload.readUInt8(idx) !== 0 ? true : false;
                idx += 1;
                value.occupancy = v;
                break;
            case TYPE_NUM_OCCUPIED_BLOCKS:
                v = payload.readUInt8(idx);
                idx += 1;
                value.num_occupied_blocks = v;
                break;
            case TYPE_NUM_MOTION_EVTS:
                v = payload.readUInt16BE(idx);
                idx += 2;
                value.num_motion_events = v;
                break;
            case TYPE_NUM_FREE_BLOCKS:
                v = payload.readUInt8(idx);
                idx += 1;
                value.num_free_blocks = v;
                break;
            case TYPE_RAW_MOTION_EVTS:
                v = payload.readUInt8(idx);
                idx += 1;
                value.num_motion_events = v;
                break;
            case TYPE_BATTERY_LEVEL:
                v = payload.readUInt8(idx);
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
    return value;
  }
}

module.exports.Decoder = Allora_Payload;
