
# Payload decoder from 1M2M ED1608 Full endpoint

Author: Didier DONSEZ



    The payloads can be decrypted via the 1M2M Payload decoding JSON service
    http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=0102096100064f7a3c07a50300000000
    http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=0102086100064f7a3c07a50500000000

    http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=0200E5CC05052900000C000000000000

    {
    "MsgID":"GenSens",
    "BaromBar":"158828",
    "Temp":"12.85",
    "Humidity":"41",
    "LevelX":"0",
    "LevelY":"0",
    "LevelZ":"12",
    "VibAmp":"0",
    "VibFreq":"0"
    }

    16.3.1 Gateway GPS coordinate:1 InfoDesc = 0, 1 or 2
    2 For InfoDesc = 0 ,1 or 2, the content of the Info field encodes the GPS coordinates of the
    3 antenna broadcasting the beacon
    Size (bytes) 3 3
    Info Lat Lng
    4 The latitude and longitude fields (Lat and Lng, respectively) encode the geographical
    5 location of the gateway as follows:
    6 • The north-­south latitude is encoded using a signed 24 bit word where -­223
    7 corresponds to 90° south (the South Pole) and 223 corresponds to 90° north (the
    8 North Pole). The equator corresponds to 0.
    9 • The east-­west longitude is encoded using a signed 24 bit word where -­
    10 223corresponds to 180° west and 223 corresponds to 180° east. The Greenwich
    11 meridian corresponds to 0.

        
    {
    "MsgID":"MovingFix",
    "DevType":"4221455",
    "Temp":"24.0",
    "FixAge":"0",
    "SatInFix":"6",
    "Lat":"52.08636",
    "Lon":"5.00995",
    "Addr":"B:Korne 7, 3453 MJ De Meern, Netherlands"
    }

    MsgIDAlive MsgID 0x00
    MsgIDTracking MsgID 0x01
    MsgIDGenSens MsgID 0x02
    MsgIDRot MsgID 0x03
    MsgIDAlarm MsgID 0x04
    MsgID1WireT MsgID 0x06
    MsgIDRunning MsgID 0x07
    MsgIDVibrate MsgID 0x08
    MsgIDAnalog MsgID 0x09
    MsgIDReboot MsgID 0x0E


    typedef struct {
        byte MsgId; // Message Identification Value = 0x00
        byte MessageFormat; // For internal use
        uint8 Profile; // For internal use
        uint8 CmdAck; // Sequence number of last received Command
        byte GPSFixAge; // bit 0..7 = Age of last GPS Fix in Minutes MsgIDsee above),
        byte SatCnt_HiLL; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26
        byte Lat[3]; // bit 0..23 = latitude bit 0..23
        byte Lon[3]; // bit 0..23 = longitude bit 0..23
        byte Battery; // 0..255 == 2,5V…3.5V == 0%..100%
    }TAliveMsg;

    01 02 0861 00 06 4f7a3c 07a503 00000000

    typedef struct {
        byte MsgId; // Message Identification Value = 0x01
        unsigned int Start :1; // Start Message
        unsigned int Move :1; // Object Moving
        unsigned int Stop :1; // Object Stopped
        unsigned int Vibr :1; // Vibration Detected
        int16 Temp; // Temperature in 0,01 degC
        byte GPSFixAge; // bit 0..7 = Age of last GPS Fix in Minutes,
        byte SatCnt_HiLL; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26
        byte Lat[3]; // bit 0..23 = latitude bit 0..23
        byte Lon[3]; // bit 0..23 = longitude bit 0..23
    }TTrackMsg;

    typedef struct {
        byte MsgId; // Message Identification Value = 0x02
        byte Status; // Content Depends on Message ID ==for future use
        word BaromBar; // Air Pressure in mBar = MsgIDMsgIDBaromBar +100.000)/10)
        int16 Temp; // in 0,01 degC
        byte Humidity; // Relative Humidity in %
        int8 LevelX; // Inverse Sinus of Beam Level in Deg X-Direction -128 = -90 Degr .. +127 = +90 Degr
        int8 LevelY; // Inverse Sinus of Beam Level in Deg Y-Direction -128 = -90 Degr .. +127 = +90 Degr
        int8 LevelZ; // Inverse Sinus of Beam Level in Deg Z-Direction -128 = -90 Degr .. +127 = +90 Degr
        uint8 VibAmp; // Amplitude of Vibration Detected == Future
        uint8 VibFreq; // Approx. Frequency of Vibration Detected in Hz
        // Future
    }TGenSensMsg;



    typedef struct {
        byte MsgId; // Message Identification Value = 0x03
        unsigned int GravRotAl :1; // Mag Rotation Detected
        unsigned int MagRot :1; // Gravity Rotation Detected
        int8 GravX; // Gravity in X-Direction 64 ~~ 1G
        int8 GravY; // Gravity in Y-Direction 64 ~~ 1G
        int8 GravZ; // Gravity in Z-Direction 64 ~~ 1G
        int8 MagX; // Magnetic Field in X-direction 10 uTesla
        int8 MagY; // Magnetic Field in Y-direction 10 uTesla
        int8 MagZ; // Magnetic Field in Z-direction 10 uTesla
    }TRotMsg;

    typedef struct {
        byte MsgID; // Message Identification Value = 0x04
        unsigned int GravRotAl :1; // Gravity Rotation Detected
        unsigned int MagRot :1; // Magnetic Rotation Detected
        unsigned int MotAlarm :1; // Motion Alarm detected
        unsigned int GeoFenceAl:1 // GeoFence Violation Detected
        unsigned int VibrAl :1; // Vibration Alarm Detected
        int16 Temp; // Temperature in 0,01 Celcius
        byte Hum; // Relative Humidity in %
        word BaromBar; // Air Pressure in Mbar=MsgIDMsgIDBaromBar +100.000)/10) }TAlarmMsg;
        Typedef struct {
        byte MsgID; // Message Identification Value = 0x06
        byte NumOfSensors; // Number of 1Wire sensors currently connected
        word Temp[5]; // Store for temperatures
        // bit 0..11 Temperature in 0,1 Celcius + 550
        // Temperature range 0 = -55.0C, 1800 = 125.0C
        // bit 13..16 ShortID (0..15)
    }T1WireTMsg;

    typedef struct {
        byte MsgID; // Message Identification Value = 0x08
        byte MaxdX; // Maximum deviation in AccelerometerX
        byte MaxdY; // Maximum deviation in AccelerometerY
        byte MaxxZ; // Maximum deviation in AccelerometerZ
        byte Max1Freq; // Frequency with highest amplitude
        byte Max1Ampl; // Amplitude of Frequency with highest Amplitude
        byte Max2Freq; // Frequency with second highest amplitude
        byte Max2Ampl; // Amplitude of Frequency with second highest Amplitude
        byte Max3Freq; // Frequency with third highest amplitude
        byte Max3Ampl; // Amplitude of Frequency with third highest Amplitude
        byte vAgcVibr; // Gain Value Vibration Detection
    }TVibrMsg;


    typedef struct {
        byte MsgID; // Message Identification Value = 0x09
        int16 VBat; // Battery voltage in mV
        int16 AnalogIn1; // AnalogIn 1 in mV
        int16 AnalogIn2; // AnalogIn 2 in mV
        int16 AnalogIn3; // future use
        int16 Analogin4; // future use
    }TAnalogMsg;

    typedef struct {
        byte MsgId; // Message Identification Value = 0x0E
        byte RebootReason; // For internal use
        uint8 Profile; // For internal use
        uint8 CmdAck; // Last received Command
        dword 1M2MID; // 1M2M Serial number
        byte SrcID; // Reboot reason source file ID incl. reboot reason
        word LineNR; // Reboot reason line number
    }TReboot;
