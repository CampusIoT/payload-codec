//*****************************************************************************
// Javascript codec functions for Adeunis Temp endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

ASCOELIT_Generic_Payload = {

    'setBattery': function (value,_bat) {
        /*
        BATTERY Unsigned char (8 bits) Report type and percentage of battery level
        EVENT Unsigned char (8 bits) Event flag. See below
        OPCNT Unsigned char (16 bits) Total number of detections
        */
        var isLithium = ((_bat & 0x80) !== 0);
        value["batteryType"] = isLithium ? "3.6V Lithium-thionyl" : "3.0V Alkaline Battery";
        var _batteryLevel = (_bat & 0x7F);
        value["batteryLevel"] = _batteryLevel;

        const Batt_LOW_LVL = 2100;
        const Batt_HIGH_LVL = isLithium ? 3600 : 3000;

        // TODO : One parenthesis was missing : check the value
        value["batteryVoltage"] = (Batt_LOW_LVL + ((Batt_HIGH_LVL - Batt_LOW_LVL) * _batteryLevel) / 100);

        /*
        TODO
        Batt_LOW_LVL + (((Batt_HIGH_LVL - Batt_LOW_LVL) * percentage)) / 100)
        Where:
        Batt_LOW_LVL = 2100mV
        Batt_HIGH_LVL = 3000mV if battery type is Alkaline
        Batt_HIGH_LVL = 3600mV if battery type is Lithium-thionyl
        Percentage = the value of bit [6:0] (cannot have the value 0)
        */
    },


    'setGeneric': function (port,payload,value) {

        const PORT_Presentation=5;
        const PORT_Serial_Number=6;
        const PORT_ReleaseInfo=7;
        const PORT_BatteryLevel=8
        const PORT_ACK=10;

        switch(port) {
            case PORT_Presentation: // GENERIC
                {
                    value["model"] = payload.toString();
                }
                break;
            case PORT_Serial_Number: // GENERIC
                {
                    if(payload.length !== 8) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    value["sn"] = true;
                }
                break;
            case PORT_ReleaseInfo: // GENERIC
                {
                    if(payload.length !== 11) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    value["release"] = payload.toString();
                }
                break;
            case PORT_BatteryLevel: // GENERIC
                {
                    if(payload.length !== 1) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));
                }
                break;
            case PORT_ACK: // GENERIC
                {
                    /*
                    ACK/NACK
                    3 bytes Char <ACK> and 4 bytes Char <NACK>)
                    Acknowledgement signal sent by the sensor to server. It can be ACK or NACK depending whether or
                    not the message received from the server is fine. It also specifies on which protocol port the message
                    has been received from the server. This message is sent every time the sensor receive a setting
                    message from the server on ports 9, 11, 12 and 13
                    */
                    value["ack"] = true;
                }
                break;
            default: // GENERIC
                value["decoding_error"] = "Unknown port";
        }

    }
}


ASCOELIT_IR868LR_Payload = {
    // private method

    'setEvent': function (value,_event) {
        value["batteryLow"] = ((_event & 0x01) !== 0);
        value["tamper"] = ((_event & 0x02) !== 0);
        value["intrusion"] = ((_event & 0x04) !== 0);
    },


    'decodeUp': function (port,payload) {

        const PORT_Alive=9;
        const PORT_Sensor=20;

        var value = {};

        value.op = "merge";

        switch(port) {
            case PORT_Alive:
                {
                    if(payload.length !== 4) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));

                    setEvent(value,payload.readInt8(1));

                    value["opCnt"] = payload.readInt16BE(2); // TODO BE ou LE ???
                }
                break;
            case PORT_Sensor:
                {
                    if(payload.length !== 3) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }

                    setEvent(value,payload.readInt8(0));

                    value["opCnt"] = payload.readInt16BE(1); // TODO BE ou LE ???
                }
                break;
            default:
                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);

        }
        return value;
    }

}


ASCOELIT_PB868LRH_Payload = {

    'setEvent': function (value,_event) {
        value["batteryLow"] = ((_event & 0x04) !== 0);
        value["push"] = ((_event & 0x01) !== 0);
    },

    'decodeUp': function (port,payload) {

        const PORT_Alive=9;
        const PORT_Sensor=30;

        // TODO check port
        var value = {};

        value.op = "merge";

        switch(port) {
            case PORT_Alive:
                {
                    if(payload.length !== 10) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));
                    setEvent(value,payload.readUInt8(1));
                    value.temperature = payload.readFloat(2);
                    value.humidity = payload.readFloat(6);
                }
                break;
            case PORT_Sensor:
                {
                    if(payload.length !== 3) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }

                    setEvent(value,payload.readInt8(0));

                    value["opCnt"] = payload.readInt16BE(1); // TODO BE ou LE ???
                }
                break;
            default:
                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);
        }
        return value;
    }

}


ASCOELIT_CM868LR_Payload = {
    //
    'setEvent': function (value,_event) {
        value["batteryLow"] = ((_event & 0x01) !== 0);
        value["tamper"] = ((_event & 0x02) !== 0);
        value["intrusion"] = ((_event & 0x04) !== 0);
    },

    'decodeUp': function (port,payload) {

        const PORT_Alive=9;
        const PORT_Sensor=30;

        var value = {};

        switch(port) {
            case PORT_Alive:
                {
                    if(payload.length !== 10) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));

                    setEvent(value,payload.readUInt8(1));

                    value["temperature"] = payload.readFloatLE(2); // TODO BE ou LE ???
                    value["humidity"] = payload.readFloatLE(6); // TODO BE ou LE ???
                }
                break;
            case PORT_Sensor:
                {
                    if(payload.length !== 11) {
                        value["decoding_error"] = "Invalid length for SENSOR message";
                        break;
                    }

                    setEvent(value,payload.readInt8(0));

                    value["opCnt"] = payload.readUInt16LE(1); // TODO BE ou LE ???
                    value["temperature"] = payload.readFloatLE(3); // TODO BE ou LE ???
                    value["humidity"] = payload.readFloatLE(7); // TODO BE ou LE ???
                }
                break;
            default:
                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);

        }
        return value;
    }
}

ASCOELIT_CM868LRTH_Payload = {
    //
    'setEvent': function (value,_event) {
        value["batteryLow"] = ((_event & 0x01) !== 0);
        value["tamper"] = ((_event & 0x02) !== 0);
        value["intrusion"] = ((_event & 0x04) !== 0);
    },

    'decodeUp': function (port,payload) {

        const PORT_Alive=9;
        const PORT_Sensor=30;

        var value = {};

        switch(port) {
            case PORT_Alive:
                {
                    if(payload.length !== 10) {
                        value["decoding_error"] = "Invalid length for ALIVE message";
                        break;
                    }
                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));

                    this.setEvent(value,payload.readUInt8(1));

                    value["temperature"] = payload.readFloatLE(2); // TODO BE ou LE ???
                    value["humidity"] = payload.readFloatLE(6); // TODO BE ou LE ???
                }
                break;
            case PORT_Sensor:
                {
                    if(payload.length !== 11) {
                        value["decoding_error"] = "Invalid length for SENSOR message";
                        break;
                    }

                    this.setEvent(value,payload.readInt8(0));

                    value["opCnt"] = payload.readUInt16LE(1); // TODO BE ou LE ???
                    value["temperature"] = payload.readFloatLE(3); // TODO BE ou LE ???
                    value["humidity"] = payload.readFloatLE(7); // TODO BE ou LE ???
                }
                break;
            default:
                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);

        }
        return value;
    }
}

module.exports.Decoder = ASCOELIT_CM868LRTH_Payload;
