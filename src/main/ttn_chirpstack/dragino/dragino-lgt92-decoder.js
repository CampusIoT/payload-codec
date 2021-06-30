//
// LGT92-v1.6.4_decoder_TTN
// 

/*function Decoder(bytes, port) {

// Decode an uplink message from a buffer

// (array) of bytes to an object of fields.

var value=bytes[0]<<16 | bytes[1]<<8 | bytes[2];

if(bytes[0] & 0x80)

{

value |=0xFFFFFF000000;

}

var latitude=value/10000;//gps latitude,units: Â°

value=bytes[3]<<16 | bytes[4]<<8 | bytes[5];

if(bytes[3] & 0x80)

{

value |=0xFFFFFF000000;

}

var longitude=value/10000;//gps longitude,units: Â°

var alarm=(bytes[6] & 0x40)?"TRUE":"FALSE";//Alarm status

value=((bytes[6] & 0x3f) <<8) | bytes[7];

var batV=value/1000;//Battery,units:V

value=bytes[8]<<8 | bytes[9];

if(bytes[8] & 0x80)

{

value |=0xFFFF0000;

}

var roll=value/100;//roll,units: Â°

value=bytes[10]<<8 | bytes[11];

if(bytes[10] & 0x80)

{

value |=0xFFFF0000;

}

var pitch=value/100; //pitch,units: Â°

return {

Latitude: latitude,

Longitud: longitude,

Roll: roll,

Pitch:pitch,

BatV:batV,

ALARM_status:alarm,

};

}*/

//The function is :

function Decoder(bytes, port) {

    // Decode an uplink message from a buffer

    // (array) of bytes to an object of fields.

    var latitude;//gps latitude,units: Â°

    latitude = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) / 1000000;//gps latitude,units: Â°

    var longitude;

    longitude = (bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7]) / 1000000;//gps longitude,units: Â°

    var alarm = (bytes[8] & 0x40) ? "TRUE" : "FALSE";//Alarm status

    var batV = (((bytes[8] & 0x3f) << 8) | bytes[9]) / 1000;//Battery,units:V

    //mode of motion
    if ((bytes[10] & 0xC0) == 0x40) {
        var motion_mode = "move";
    } else if ((bytes[10] & 0xC0) == 0x80) {
        motion_mode = "collide";
    } else if ((bytes[10] & 0xC0) == 0xC0) {
        motion_mode = "user";
    } else {
        motion_mode = "disable";
    }
 
    var led_updown = (bytes[10] & 0x20) ? "ON" : "OFF";//LED status for position,uplink and downlink

    var Firmware = 160 + (bytes[10] & 0x1f);  // Firmware version; 5 bits 

    var roll = (bytes[11] << 24 >> 16 | bytes[12]) / 100;//roll,units: Â°

    var pitch = (bytes[13] << 24 >> 16 | bytes[14]) / 100; //pitch,units: Â°

    var hdop = 0;

    if (bytes[15] > 0) {
        hdop = bytes[15] / 100; //hdop,units: Â°
    } else {
        hdop = bytes[15];
    }

    var altitude = (bytes[16] << 24 >> 16 | bytes[17]) / 100; //Altitude,units: Â°

    return {
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        hdop: hdop,
        roll: roll,
        pitch: pitch,
        battery: batV,
        alarm_status: alarm,
        md: motion_mode,
        lon: led_updown,
        fw: Firmware
    };
}

function Decode(port, bytes) {
    function Decoder(bytes, port);
}
