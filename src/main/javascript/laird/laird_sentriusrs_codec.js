//*****************************************************************************
// Javascript codec functions for Laird Senstrius RS endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

// From https://assets.lairdtech.com/home/brandworld/files/RS1xx%20LoRa%20Protocol_v2_0.pdf

// Convert the two byte sensor data format to a signed number
//
// tInt: the integer portion of the temp
// tDec: the fractional portion of the temp
//
function convertTempUnits( tDec ,  tInt ){

    // the integer portion is a signed two compliment value convert it to a signed number
    if( tInt > 127 ){
        tInt -= 256
    }

    // the fractional portion of the number is unsigned and represents the part of the temp
    // after the base 10 decimal point
    let t = tInt + (tDec * Math.sign(tInt)) / 100;

    // if the global flag for using degreesFahenheit is set convert the units
    /*
    if(global.get("degreesFahrenheit")){
        t = t * 1.8 + 32;
    }
    */
    return t;
}

Laird_Sentrius_RS_Payload = {

    'decodeOptions': function (options,value) {
        // bit 0 = Server response is LoRa ack.
        // bit 1 = Server to send UTC to sensor. Since LoRa messages are initiated by the sensor this will happen on the next time the sensor talks to the server.
        // bit 2 = Sensor configuration error.
        // bit 4 = Sensor has alarm condition.
        value.loraack = (options & 0x01 !== 0) ? true : false;
        value.sendutc = (options & 0x02 !== 0) ? true : false;
        value.configerror = (options & 0x04 !== 0) ? true : false;
        value.alarm = (options & 0x10 !== 0) ? true : false;
    },

    'decodeUp': function (port,payload) {
        const MSGTYPE_SendTempRHData = 0x01;
        const MSGTYPE_SendTempRHAggregatedData = 0x02;
        const MSGTYPE_Config = 0x03;
        const MSGTYPE_SendBackLogMessages = 0x04;
        const MSGTYPE_SendSensorConfigSimple = 0x05;
        const MSGTYPE_SendSensorConfigAdvanced = 0x06;
        const MSGTYPE_SendFWVersion = 0x07;

        var value = {};

        var idx = 0;

        // These two values are common across all packets
        var msgType = payload[idx++];
        value.msgType = msgType;

        var options  = payload[idx++];
        Laird_Sentrius_RS_Payload.decodeOptions(options,value);

        switch(msgType) {
            case MSGTYPE_SendTempRHData:  // handle the single temp and humidity reading
                value.humidity = payload[idx++] / 100 + payload[idx++];
                value.temperature  = convertTempUnits(payload[idx++], payload[idx++]);
                value.batteryLevel = payload[idx++] * 20;
                // Number of backlog alarm messages in sensor FLASH
                value.alarmMsgCount = payload.readUInt16BE(idx); idx += 2;
                // Number of backlog non-alarm messages in sensor FLASH
                value.backlogMsgCount = payload.readUInt16BE(idx); idx += 2;
                break;
            case MSGTYPE_SendTempRHAggregatedData:  // handle the aggregate temp and humidity reading
                //handleMsgType_2( msg );
                break;
            case MSGTYPE_SendSensorConfigSimple:  // handle the simpleConfig message
                // 1 = Zinc-Manganese Dioxide (Alkaline). 2 = Lithium/Iron Disulfide (Primary Lithium).
                value.batteryType = payload[idx++];
                value.batteryTypeStr = value.batteryType === 1 ? "Alkaline" : "Lithium";
                // Period in seconds to read the sensor. 0 = Disabled
                value.readSensorPeriod = payload[idx++] * 256 + payload[idx++];
                // Number of readings to aggregate before sending on LoRa
                //value.sensorAggregate = payload[idx++];
                value.sensorAggregate = payload[idx++];
                value.temperatureAlarmEnabled = payload[idx++] === 0 ? false : true;
                value.humidityAlarmEnabled = payload[idx++] === 0 ? false : true;
                break;
            case MSGTYPE_SendFWVersion:  // handle the simpleConfig message
                value.fw_date = payload[idx++] + "" + payload[idx++] + "" + payload[idx++];
                value.fw_version = payload[idx++] + "." + payload[idx++];
                value.partNumber = payload.readUInt32BE(idx);
                break;
            default:
                break;
        }

        return value;
    }
}
