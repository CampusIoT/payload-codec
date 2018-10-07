//*****************************************************************************
// Javascript codec functions for Rising HF endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

RisingHF_WS1TH_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port
    	var value =  {};

		/*
		3.2.1 Header
		D7: Toggle when receive a downlink.
		D6: Current status. When door sensor status changed, this bit would be changed also and trigger a transmit.
		D5~D2: Reserved.
		D1~D0: Header type, 1: normal, others: reserved.
		*/
        var _header = payload.readUInt8(0);
        value["header"] = _header;

		/*
		3.2.2 Temperature Get payload 6c 68(little endian), convert to HEX format 0x686c, it is 26732 in decimal. Use formula below to calculate. ℃
		t=26732 (0x686C), then T=24.8℃.
		*/
        var _temperature = payload.readInt16LE(1);
        value["temperature"] = ((175.72*_temperature)/(Math.pow(2, 16)) - 46.85);

		/*
		3.2.3 Humidity Get payload 9d, convert to HEX format 0x9d, it is 157 in decimal. Use formula below to calculate.
		rh=157 (0x9d), then RH=71% Note: The Humidity would be reserved in future product if no need in future.
		*/
        var _humidity = payload.readUInt8(3);
        value["humidity"] = ((125*_humidity)/256 - 6);

		/*
		3.2.4 Period Get payload 30 00(little endian), convert to HEX format 0x0030, it is 48 in decimal, the unit is 2s. So the period is 96s. Note: LoRaWAN is an Aloha protocol, the real transmitting period will have a random offset each time, random offset default value -10 ~ 10s, read device configuration through RCFG tool to know the exact value.
		*/
        var _period = payload.readUInt16LE(4); // TODO : CHECK SIGNED OR UNSIGNED
        value["period"] = _period * 2;

		/*
		3.2.5 RSSI & SNR
		RSSI and SNR of last received payload, 0xFF means RHF1Sxxx never gets downlink and RSSI/SNR is unknown, server could use this information to estimate downlink link budget.
		Formula:
		From the example:
		RSSI is 0x90, SNR is 0x29. RSSI = -180+144 = -36dBm; SNR = 41/4 =
		*/
        var _rssi = payload.readUInt8(6); // TODO : CHECK SIGNED OR UNSIGNED
        value["rssi"] = (_rssi - 180);

        var _snr = payload.readUInt8(7); // TODO : CHECK SIGNED OR UNSIGNED
        value["snr"] = (((_snr ^ 0xFF)+1) /4.0);

		/*
		3.2.6 Battery level Battery voltage level unit is 0.01V. Get payload C8, covert to decimal 200.
		In prototype, no battery is used. So the voltage level would be always same which is the level of regulator output.

		C8 means battery level is 3.5V Note: Battery percentage value is to be defined.
		*/
        var _battery = payload.readInt8(8);
        //value["batteryLevel"] = (_battery + 150) * 0.01;
        value["batteryLevel"] = (((_battery + 150) * 0.01) * 100);

    	return value;
    }
}


RisingHF_WSA_3X_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port
		// port is 8

    	var value =  {};
		/*
		First 2 BE bytes are for x-axis, mid 2 BE bytes are for y-axis, last 2 BE bytes are for z-axis.
		Acceleration Conversion: (g is acceleration of gravity, ~9.8m/s2)
		AXs = 0x0038 -> AX = AXs/256 * g -> AX = 0x38/256 g = 0.22g
		AYs = 0x0084 -> AY = AYs/256 * g -> AY = 0x84/256 g =0.52g
		AZs = 0x00d2 -> AZ = AZs/256 * g -> AZ = 0xd2/256 g = 0.82g
		*/
        var _accx = payload.readInt16BE(0) / 256.0; // in g
        value["accx"] = _accx;

        var _accy = payload.readInt16BE(2) / 256.0; // in g
        value["accy"] = _accy;

        var _accz = payload.readInt16BE(4) / 256.0; // in g
        value["accz"] = _accz;

    	var threshold = 1; // TODO should be paramaterable

    	console.log("Acceleration : ",_accx,_accy,_accz);

    	//value["presence"] = (Math.abs(_accx) > threshold) || (Math.abs(_accy) > threshold) || (Math.abs(_accz) > threshold);
    	//value["motion"] = (Math.abs(_accx) > threshold) || (Math.abs(_accy) > threshold) || (Math.abs(_accz) > threshold);
    	//value["motion"] = true;

    	return value;
    }
}

// TODO : MUST BE TESTED
RisingHF_WSA_Flame_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port

		// port is 8

    	var value =  {};
		/*
		AW-WSA Flame sensor returns 1 byte payload each packet. For example:
		01
		00 -> Normal
		01 -> Flame is detected
		*/
        var _flame = payload.readInt8(0); // TODO : CHECK SIGNED OR UNSIGNED
        value["flame"] = (_flame === 1);

    	return value;
    }
}

RisingHF_WSA_InfraredTemperature_Payload = {
    'decode': function (port,payload) {
    	// TODO check port

		// port is 8

    	var value =  {};
		/*
		4.4 Infrared Temperature
		AW-WSA Infrared sensor returns 2 bytes payload each packet. For example:
		09 1f
		Temperature Conversion:
		Ts = 0x091f -> T = Ts/100 -> T = 0x091f/100 -> T = 2335/100= 23.5°
		*/
        var _temperature = payload.readInt16BE(0); // TODO : CHECK SIGNED OR UNSIGNED
        value["temperature"] = _temperature/100.0;

    	return value;
    }
}

// TODO : MUST BE TESTED
RisingHF_WSA_TemperatureHumidity_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port

		// port is 8

    	var value =  {};
		/*
		4.1 Temperature and Humidity
		AW-WSA temperature and humidity sensor returns 4 bytes payload each packet. For
		example:
		09 0c 06 2e
		First 2 bytes are for temperature, last 2 bytes are for humidity.
		Temperature Conversion:
		Ts = 0x090c -> T = Ts/32 - 50 -> T = 0x090c/32 - 50 -> T = 2316/32 - 50 = 22.4°
		Humidity Conversion:
		RHs = 0x062e -> 100RH = RHs/16-24 -> 100RH = 0x062e/16-24=74.9 -> RH = 74.9%
		*/
        var _temperature = payload.readInt16BE(0);  // TODO : CHECK SIGNED OR UNSIGNED
        value["temperature"] = _temperature/32.0 - 50;

        var _humidity = payload.readInt16BE(2); // TODO : CHECK SIGNED OR UNSIGNED
        value["humidity"] = _humidity/16.0 - 24;

    	return value;
    }
}

// TODO : MUST BE TESTED
RisingHF_WSA_Light_Payload = {
    'decodeUp': function (port,payload) {
    	// TODO check port

		// port is 8

    	var value =  {};
		/*
		4.2 Light
		AW-WSA Light sensor returns 4 bytes payload each packet. For example:
		00 00 00 27
		Illuminance:
		Es = 0x00000027 -> E=Es lx -> E=39lx
		*/
        var _light = payload.readInt32BE(0); // TODO : CHECK SIGNED OR UNSIGNED
        value["light"] = _light;

    	return value;
    }
}
