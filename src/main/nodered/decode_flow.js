[
    {
        "id": "44d19984.f5a968",
        "type": "link in",
        "z": "fe068cdd.273a8",
        "name": "",
        "links": [
            "3f16ad5c.9431c2"
        ],
        "x": 120,
        "y": 220,
        "wires": [
            [
                "c3161548.5727e8"
            ]
        ]
    },
    {
        "id": "c3161548.5727e8",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Convert data",
        "func": "if(msg.payload.object) {\n    return msg;\n} else {\n    if(msg.payload.data){\n        msg.payload.frmPayload = Buffer.from(msg.payload.data, 'base64');\n        return msg;\n    } else {\n        return undefined;\n    }\n}\n",
        "outputs": 1,
        "noerr": 0,
        "x": 280,
        "y": 220,
        "wires": [
            [
                "d8634081.1d2198",
                "2aabf09b.de0f3",
                "938241bf.9b3798",
                "be3fcad4.1dfa5",
                "4ca89a14.045074",
                "3b1e7e90.6689d2",
                "fa71b998.195b8",
                "92d78a6.a60eb78",
                "41cd83dd.2aa08c",
                "8eaa1326.d23828",
                "aedd2557.ffe26",
                "9a62db47.47ca",
                "a22631e1.65139",
                "78afa664.e3c4d"
            ]
        ]
    },
    {
        "id": "d8634081.1d2198",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode DemoMote",
        "func": "\nAdeunisRF_ARF8084BA_Motev10_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port\n    \tvar p = payload;\n\n\t    if (p.length === 14) {\n\n\t    \tvar value = {};\n\n\t        var accelerometerTrigger=((p[0]&0x40) != 0);\n\t        value[\"accelerometerTrigger\"]=accelerometerTrigger;\n\n\t        var button1Trigger=((p[0]&0x20) != 0);\n\t        value[\"button1Trigger\"]=button1Trigger;\n\n\t        // decode Adeunis payload\n\t        //var temperature = getCalibratedTemperature(deveui,p.readInt8(1)); // in °C\n\t\t\t// TEMPERATURE IN NOT CALIBRATED\n\t        var temperature = p.readInt8(1); // in °C\n\t        value[\"temperature\"]=temperature;\n\n\t        var latdegrees=(((p[2]&0xF0) >> 4) * 10) + (p[2]&0x0F);\n\t        var latminutes=    (((p[3]&0xF0) >> 4) * 10)\n\t                        + (p[3]&0x0F)\n\t                        + (((p[4]&0xF0) >> 4) /10)\n\t                        + ((p[4]&0x0F) / 100)\n\t                        + (((p[5]&0xF0) >> 4) /1000)\n\t                        ;\n\t        var latitude = (latdegrees + (latminutes / 60));\n\t        if((p[5]&0x0F)==1) latitude=-latitude;\n\t        value[\"latitude\"]=latitude;\n\n\n\t        var londegrees=(((p[6]&0xF0) >> 4) * 100) + ((p[6]&0x0F)* 10) + ((p[7]&0xF0) >> 4);\n\t        var lonminutes= ((p[7]&0x0F) * 10)\n\t                        + ((p[8]&0xF0) >> 4)\n\t                        + ((p[8]&0x0F) / 10)\n\t                        + (((p[9]&0xF0) >> 4) /100)\n\t                        ;\n\t        var longitude = (londegrees + (lonminutes / 60));\n\t        if((p[9]&0x0F)==1) longitude=-longitude;\n\t        value[\"longitude\"]=longitude;\n\n\t        var uplinkCounter=p.readUInt8(10);\n\t        value[\"uplinkCounter\"]=uplinkCounter;\n\n\t        var downlinkCounter=p.readUInt8(11);\n\t        value[\"downlinkCounter\"]=downlinkCounter;\n\n\t        var batteryVoltage = p.readInt16BE(12); // in mV\n\t        value[\"batteryVoltage\"]=batteryVoltage;\n\n\t    \treturn value;\n\n\t    } else if (p.length === 6) {\n\n\t    \tvar value = {};\n\n\t        var accelerometerTrigger=((p[0]&0x40) != 0);\n\t        value[\"accelerometerTrigger\"]=accelerometerTrigger;\n\n\t        var button1Trigger=((p[0]&0x20) != 0);\n\t        value[\"button1Trigger\"]=button1Trigger;\n\n\t        // decode Adeunis payload\n\t        //var temperature = getCalibratedTemperature(deveui,p.readInt8(1)); // in °C\n\t        var temperature = p.readInt8(1); // in °C\n\t        value[\"temperature\"]=temperature;\n\n\t        var uplinkCounter=p.readUInt8(2);\n\t        value[\"uplinkCounter\"]=uplinkCounter;\n\n\t        var downlinkCounter=p.readUInt8(3);\n\t        value[\"downlinkCounter\"]=downlinkCounter;\n\n\t        var batteryVoltage = p.readInt16BE(4); // in mV\n\t        value[\"batteryVoltage\"]=batteryVoltage;\n\n\t    \treturn value;\n\t    } else {\n\t    \treturn undefined;\n\t    }\n\t},\n\n    'getLatlng': function (port,value) {\n    \tif(value.latitude !== undefined && value.longitude !== undefined) {\n    \t\treturn {lat: value.latitude, lng:value.longitude};\n    \t} else {\n    \t\treturn undefined;\n    \t}\n    }\n}\n\nAdeunisRF_ARF8084BA_DemoMote_Payload = {\n    'decodeUp': function (port,payload) {\n\n\t    \tvar value = {};\n\n\t    \tvar flags = p[0];\n\n\t        var accelerometerTrigger=((flags&0x40) !== 0);\n\t        value[\"accelerometerTrigger\"]=accelerometerTrigger;\n\n\t        var button1Trigger=((flags&0x20) !== 0);\n\t        value[\"button1Trigger\"]=button1Trigger;\n\n\t        var index = 1;\n\n\t\t    // decode Adeunis payload\n\n\t        if(flags && 0x80 !== 0) {\n\t\t        //var temperature = getCalibratedTemperature(deveui,p.readInt8(1)); // in °C\n\t\t        var temperature = p.readInt8(index++); // in °C\n\t\t        value[\"temperature\"]=temperature;\n\t        }\n\n\t        if(flags && 0x10 !== 0) {\n\t\t        var latdegrees=(((p[index]&0xF0) >> 4) * 10) + (p[index++]&0x0F);\n\t\t        var latminutes=    (((p[index]&0xF0) >> 4) * 10)\n\t\t                        + (p[index++]&0x0F)\n\t\t                        + (((p[index]&0xF0) >> 4) /10)\n\t\t                        + ((p[index++]&0x0F) / 100)\n\t\t                        + (((p[index]&0xF0) >> 4) /1000)\n\t\t                        ;\n\t\t        var latitude = (latdegrees + (latminutes / 60));\n\t\t        if((p[index++]&0x01)==1) latitude=-latitude;\n\t\t        value[\"latitude\"]=latitude;\n\n\n\t\t        var londegrees=(((p[index]&0xF0) >> 4) * 100) + ((p[index++]&0x0F)* 10) + ((p[index]&0xF0) >> 4);\n\t\t        var lonminutes= ((p[index++]&0x0F) * 10)\n\t\t                        + ((p[index]&0xF0) >> 4)\n\t\t                        + ((p[index++]&0x0F) / 10)\n\t\t                        + (((p[index]&0xF0) >> 4) /100)\n\t\t                        ;\n\t\t        var longitude = (londegrees + (lonminutes / 60));\n\t\t        if((p[index++]&0x01)==1) longitude=-longitude;\n\t\t        value[\"longitude\"]=longitude;\n\t\t    }\n\n\t        if(flags && 0x08 !== 0) {\n\t\t        var uplinkCounter=p.readUInt8(index++);\n\t\t        value[\"uplinkCounter\"]=uplinkCounter;\n\t\t    }\n\n\t        if(flags && 0x04 !== 0) {\n\t\t        var downlinkCounter=p.readUInt8(index++);\n\t\t        value[\"downlinkCounter\"]=downlinkCounter;\n\t\t    }\n\n\t        if(flags && 0x02 !== 0) {\n\t\t        var batteryVoltage = p.readInt16BE(index); // in mV\n\t\t        index = index + 2;\n\t\t        value[\"batteryVoltage\"]=batteryVoltage;\n\t\t\t}\n\n\t\t\tif(flags && 0x01 !== 0) {\n\t\t        var rssi = p.readUInt8(index++); // in dB absolute value\n\t\t        var snr = p.readUInt8(index++); // in dB, signed\n\t\t        value[\"rssi\"]=rssi;\n\t\t        value[\"snr\"]=snr;\n\t\t\t}\n\n\t    \treturn value;\n    }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"DEMOMOTE\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\n// TODO add image for worldmap\n\nvar o = AdeunisRF_ARF8084BA_Motev10_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 510,
        "y": 220,
        "wires": [
            [
                "a0339945.fda27",
                "afb54073.becdf"
            ]
        ]
    },
    {
        "id": "2aabf09b.de0f3",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode FTD",
        "func": "// https://www.adeunis.com/wp-content/uploads/2017/08/ARF8123AA_ADEUNIS_LORAWAN_FTD_UG_V1.2.0_FR_GB.pdf\nAdeunisRF_ARF8123AA_FieldTester_Payload = {\n  'decodeUp': function (port,payload) {\n\n      var value = {}\n      var p = payload;\n\n      /*\n      Bit 7 : Présence de l’information de température\n      Bit 6 : Déclenchement de l’émission par l’accéléromètre\n      Bit 5 : Déclenchement de l’émission par appui sur le bouton poussoir 1\n      Bit 4 : Présence de l’information GPS\n      Bit 3 : Présence du compteur de trame d’Uplink\n      Bit 2 : Présence du compteur de trame de Downlink\n      Bit 1 : Présence de l’information du niveau de batterie\n      Bit 0 : Présence de l’informaiotn RSSI et SNR\n      */\n        \n    var flags = p[0];\n\n    var accelerometerTrigger=((flags&0x40) !== 0);\n    value[\"accelerometerTrigger\"]=accelerometerTrigger;\n\n    var button1Trigger=((flags&0x20) !== 0);\n    value[\"button1Trigger\"]=button1Trigger;\n\n    var index = 1;\n\n    // decode Adeunis payload\n\n    if(flags & 0x80 !== 0) {\n          var temperature = p.readInt8(index++); // in °C\n          value[\"temperature\"]=temperature;\n        }\n\n    if((flags & 0x10) !== 0) {\n          var latdegrees=(((p[index]&0xF0) >> 4) * 10) + (p[index++]&0x0F);\n          var latminutes=    (((p[index]&0xF0) >> 4) * 10)\n                          + (p[index++]&0x0F)\n                          + (((p[index]&0xF0) >> 4) /10)\n                          + ((p[index++]&0x0F) / 100)\n                          + (((p[index]&0xF0) >> 4) /1000)\n                          ;\n          var latitude = (latdegrees + (latminutes / 60));\n          if((p[index++]&0x01)==1) latitude=-latitude;\n          value[\"latitude\"]=latitude;\n\n          var londegrees=(((p[index]&0xF0) >> 4) * 100) + ((p[index++]&0x0F)* 10) + ((p[index]&0xF0) >> 4);\n          var lonminutes= ((p[index++]&0x0F) * 10)\n                          + ((p[index]&0xF0) >> 4)\n                          + ((p[index++]&0x0F) / 10)\n                          + (((p[index]&0xF0) >> 4) /100)\n                          ;\n          var longitude = (londegrees + (lonminutes / 60));\n          if((p[index++]&0x01)==1) longitude=-longitude;\n          value[\"longitude\"]=longitude;\n\n          var gpsquality = p.readUInt8(index++);\n          value[\"satellites\"]=gpsquality&0x0F;\n          value[\"quality\"]=gpsquality >> 4;\n\n      }\n\n    if(flags & 0x08 !== 0) {\n          var uplinkCounter=p.readUInt8(index++);\n          value[\"uplinkCounter\"]=uplinkCounter;\n      }\n\n    if(flags & 0x04 !== 0) {\n          var downlinkCounter=p.readUInt8(index++);\n          value[\"downlinkCounter\"]=downlinkCounter;\n      }\n\n    if(flags & 0x02 !== 0) {\n          var batteryVoltage = p.readInt16BE(index); // in mV\n          index = index + 2;\n          value[\"batteryVoltage\"]=batteryVoltage;\n    }\n\n    if(flags & 0x01 !== 0) {\n          var rssi = p.readUInt8(index++); // in dB absolute value\n          var snr = p.readUInt8(index++); // in dB, signed\n          value[\"rssi\"]= - rssi;\n          value[\"snr\"]=snr;\n    }\n\n    return value;\n  }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"FTD\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = AdeunisRF_ARF8123AA_FieldTester_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 490,
        "y": 280,
        "wires": [
            [
                "e7df8e01.4ddc68",
                "afb54073.becdf"
            ]
        ]
    },
    {
        "id": "938241bf.9b3798",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Semtech LoRaMote",
        "func": "\n// Value used for the conversion of the position from DMS to decimal \nconst MaxNorthPosition = 8388607; // 2^23 - 1\nconst MaxSouthPosition = 8388608; // -2^23\nconst MaxEastPosition = 8388607; // 2^23 - 1    \nconst MaxWestPosition = 8388608; // -2^23      \n\n\n/*\nIn LoRaWAN Spec 1.0 (page 75/80)\n16.3.1 Gateway GPS coordinate:1 InfoDesc = 0, 1 or 2\n2 For InfoDesc = 0 ,1 or 2, the content of the Info field encodes the GPS coordinates of the\n3 antenna broadcasting the beacon\nSize (bytes) 3 3\nInfo Lat Lng\n4 The latitude and longitude fields (Lat and Lng, respectively) encode the geographical\n5 location of the gateway as follows:\n6 • The north-­south latitude is encoded using a signed 24 bit word where -­223\n7 corresponds to 90° south (the South Pole) and 223 corresponds to 90° north (the\n8 North Pole). The equator corresponds to 0.\n9 • The east-­west longitude is encoded using a signed 24 bit word where -­\n10 223corresponds to 180° west and 223 corresponds to 180° east. The Greenwich\n11 meridian corresponds to 0.\n*/\n\n\n// Utility functions\nNumber.prototype.roundUsing = function (func, prec) {\n    var temp = this * Math.pow(10, prec);\n    temp = func(temp);\n    return temp / Math.pow(10, prec);\n}\n\nfunction getDegree(payload, pos, maxDeg) {\n    // payload is a baffer containing 3 bytes (signed 24b integer) at position pos\n    // maxDeg is 90 for latitude and 180 for longitude\n\n    var val = payload[pos+0]<<16 + payload[pos+1]<<8 + payload[pos+2]; // BE or LE\n    res = (val * maxDeg / MaxEastPosition).roundUsing(Math.ceil, 5);\n\n    return res;\n} \n\nSemtech_LoRaMote_Payload = {\n\t// for default firmware of loranet/loranode\n    'decodeUp': function (port,payload) {\n    \t// TODO check port\n\n    \tvar value = {};\n\n        var _appLedStateOn = payload[0];\n        value[\"led\"] = _appLedStateOn;\n\n        var _pressure = Math.round(payload.readInt16BE(1) / 10); // in hPa\n        value[\"pressure\"] = _pressure;\n\n        var _temperature = (payload.readInt16BE(3) / 100.0).roundUsing(Math.ceil, 1); // in °C\n        value[\"temperature\"] = _temperature;\n\n        var _altitudeBar = Math.round(payload.readInt16BE(5) / 10); // in m \n        value[\"altitudeBar\"] = _altitudeBar;\n\n        var _batteryLevel = Math.round((payload[7] * 100) / 254); // in %\n        value[\"battery\"] = _batteryLevel;\n\n        // TODO undefined latitude\n         // TODO should fix for negative latitude\n         // IN THIS VERSION, \n        var _latitude = payload.readUInt32BE(8);\n        console.log(\"_latitude:\",_latitude);\n        //_latitude = _latitude & 0x00FFFFFF;\n        _latitude = _latitude >> 8;\n        console.log(\"_latitude:\",_latitude);\n        _latitude = (_latitude * 90.0 / MaxNorthPosition).roundUsing(Math.ceil, 5);\n        console.log(\"_latitude:\",_latitude);\n        value[\"latitude\"] = _latitude;\n\n        // TODO undefined longitude\n        // TODO should fix for negative longitude\n        var _longitude = payload.readUInt32BE(11);\n        console.log(\"_longitude:\",_longitude);\n        //_longitude = _longitude & 0x00FFFFFF;\n        _longitude = _longitude >> 8;\n        console.log(\"_longitude:\",_longitude);\n        _longitude = (_longitude * 180.0 / MaxEastPosition).roundUsing(Math.ceil, 5);\n        console.log(\"_longitude:\",_longitude);\n        value[\"longitude\"] = _longitude;\n\n\n        // TODO undefined altitude\n        var _altitudeGps = payload.readInt16BE(14); // in m\n        if (_altitudeGps === -256) _altitudeGps = 0;\n        value[\"altitudeGps\"] = _altitudeGps;\n\n    \treturn value;\n    },\n\n    'getLatlng': function (port,value) {\n        if(value.latitude !== undefined && value.longitude !== undefined) {\n            return {lat: value.latitude, lng:value.longitude};\n        } else {\n            return undefined;\n        }\n    }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"LORAMOTE\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = Semtech_LoRaMote_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 540,
        "y": 340,
        "wires": [
            [
                "708abecd.9d5248",
                "afb54073.becdf"
            ]
        ]
    },
    {
        "id": "be3fcad4.1dfa5",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Adeunis Temp",
        "func": "\nAdeunisRF_Temp_Payload = {\n\n    'decodeUp': function (port,payload) {\n\t    var value = {};\n\n    \t// TODO check port\n\n\t\t// cf 4.1.1\n\n    \tvar p = payload;\n\n    \t// check length : must be 12-byte long.\n    \tvar code \t\t= p[0];\n    \tvar status \t\t= p[1];\n\t    var status \t\t= p[1];\n\t    var error\t\t= status & 0x0F;\n\n\t    if(error === 0) {\n\t\t    value[\"noerror\"] \t\t\t= true;\n\t\t} else if((error & 0x01) !== 0) {\n\t\t    value[\"configurationdone\"] \t\t\t= true;\n\t\t} else if((error & 0x02) !== 0) {\n\t    \tvalue[\"lowbaterror\"]\t\t\t\t= true;\n\t\t} else if((error & 0x04) !== 0) {\n\t\t    value[\"hwerror\"] \t\t\t\t\t= true;\n\t\t}\n\n\t    value[\"counter\"] = status >> 5;\n\n    \tif(code === 0x30) {\n    \t\t// length is 8\n\t    \tvar internalId\t= p[2]\n\t    \tvar internalValue\t= p[3]+(p[4]<<8); // LSB First\n\t    \tvar externalId\t\t= p[5];\n\t    \tvar externalValue\t= p[6]+(p[7]<<8); // LSB First\n\n \t    \tvalue[\"code\"] \t= code;\n\t\t    value[\"internal_id\"] \t= internalId;\n\t\t    value[\"temperature_internal\"] \t= internalValue/10.0;\n\t\t    value[\"external_id\"] \t= externalId;\n\t\t    value[\"temperature_external\"] \t= externalValue/10.0;\n\t\t    \n    \t} else if(code === 0x43) {\n    \t\t// length is 8\n\t    \tvar internalId\t= p[2]\n\t    \t//var internalValue\t= p[3]+(p[4]<<8); // LSB First\n\t    \tvar internalValue\t= p.readInt16BE(3)/10.0;\n\t    \tvar externalId\t\t= p[5];\n\t    \t// var externalValue\t= p[6]+(p[7]<<8); // LSB First\n\t    \tvar externalValue\t= p.readInt16BE(6)/10.0;\n\n \t    \tvalue[\"code\"] \t= code;\n\t\t    value[\"internal_id\"] \t= internalId;\n\t\t    value[\"temperature_internal\"] \t= internalValue;\n\t\t    value[\"external_id\"] \t= externalId;\n\t\t    value[\"temperature_external\"] \t= externalValue;\n\t\t    \n        } else if(code === 0x20) {\n\t\t\t// length is 4\n\t    \tvar adr\t    = (p[2] === 1);\n\t    \tvar otaa    = (p[3] === 1);\n \t    \tvalue[\"code\"] \t= code;\n\t    \tvalue[\"adr\"] \t= adr;\n\t\t    value[\"otaa\"] \t= otaa;\n    \t} else if(code === 0x11) {\n\t\t\t// length is 99\n    \t\t// TODO\n    \t\t/*\n    \t\tOctets 2 à 3 : registre 324, seuil haut du capteur interne, octet de poids fort en premier\n            • Octet 4 : registre 325, hystérésis seuil haut du capteur interne\n            • Octets 5 à 6 : registre 326, seuil bas du capteur interne, octet de poids fort en premier\n            • Octet 7 : registre 327, hystérésis seuil bas du capteur interne\n            • Octet 8 : registre 333, facteur de sur-échantillonnage\n            */\n \t    \tvalue[\"code\"] \t= code;\n \t    \tvalue[\"status\"] \t= status;\n   \t\t    return value;\n\n    \t} else if(code === 0x10) {\n\t\t\t// length is 11\n    \t\t// TODO\n    \t\t/*\n    \t\t• Octet 2 : registre 300, périodicité de la trame de vie, exprimé en dizaine de minutes\n            • Octet 3 : registre 301, périodicité de la transmission (Mode périodique), exprimé en dizaine de minutes\n            • Octet 4 : registre 320, configuration du capteur interne\n            • Octet 5 : registre 321, configuration des évènements du capteur interne\n            • Octet 6 : registre 322, configuration du capteur externe\n            • Octet 7 : registre 323, configuration des évènements du capteur externe\n            • Octet 8 : registre 306, mode du produit (PARC, STANDARD (production), TEST ou REPLI)\n            • Octet 9 : type de capteur externe :\n            o 0 = désactivé\n            o 1 = inconnu\n            o 2 = FANB57863-400-1\n            • Octet 10 : registre 332, périodicité de l’acquisition, exprimé en minute\n            */ \t\t\n \t    \tvalue[\"code\"] \t= code;\n \t    \tvalue[\"status\"] \t= status;\n   \t\t    return value;\n\n    \t}\n\n\t    return value;\n\t}\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ADEUNIS_TEMP\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = AdeunisRF_Temp_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 520,
        "y": 460,
        "wires": [
            [
                "4284d05.b9b56b"
            ]
        ]
    },
    {
        "id": "4ca89a14.045074",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Laird TH",
        "func": "// From https://assets.lairdtech.com/home/brandworld/files/RS1xx%20LoRa%20Protocol_v2_0.pdf\n\nLaird_Sentrius_RS_Payload = {\n\n    'decodeOptions': function (options,value) {\n        // bit 0 = Server response is LoRa ack.\n        // bit 1 = Server to send UTC to sensor. Since LoRa messages are initiated by the sensor this will happen on the next time the sensor talks to the server.\n        // bit 2 = Sensor configuration error.\n        // bit 4 = Sensor has alarm condition.\n        value.loraack = (options & 0x01 !== 0) ? true : false;\n        value.sendutc = (options & 0x02 !== 0) ? true : false;\n        value.configerror = (options & 0x04 !== 0) ? true : false;\n        value.alarm = (options & 0x10 !== 0) ? true : false;\n    },\n    \n    'decodeUp': function (port,payload) {\n        const MSGTYPE_SendTempRHData = 0x01;\n        const MSGTYPE_SendTempRHAggregatedData = 0x02;\n        const MSGTYPE_Config = 0x03;\n        const MSGTYPE_SendBackLogMessages = 0x04;\n        const MSGTYPE_SendSensorConfigSimple = 0x05;\n        const MSGTYPE_SendSensorConfigAdvanced = 0x06;\n        const MSGTYPE_SendFWVersion = 0x07;\n        \n        var value = {};\n    \n        var idx = 0;\n        \n        // These two values are common across all packets \n        var msgType = payload[idx++];\n        value.msgType = msgType;\n\n        var options  = payload[idx++];\n        Laird_Sentrius_RS_Payload.decodeOptions(options,value);\n\n        switch(msgType) {\n            case MSGTYPE_SendTempRHData:  // handle the single temp and humidity reading\n                value.humidity = payload[idx++] / 100 + payload[idx++];\n                value.temperature  = convertTempUnits(payload[idx++], payload[idx++]);\n                value.batteryLevel = payload[idx++] * 20;\n                // Number of backlog alarm messages in sensor FLASH\n                value.alarmMsgCount = payload.readUInt16BE(idx); idx += 2;\n                // Number of backlog non-alarm messages in sensor FLASH\n                value.backlogMsgCount = payload.readUInt16BE(idx); idx += 2;\n                break;\n            case MSGTYPE_SendTempRHAggregatedData:  // handle the aggregate temp and humidity reading \n                //handleMsgType_2( msg );\n                break;\n            case MSGTYPE_SendSensorConfigSimple:  // handle the simpleConfig message \n                // 1 = Zinc-Manganese Dioxide (Alkaline). 2 = Lithium/Iron Disulfide (Primary Lithium).\n                value.batteryType = payload[idx++];\n                value.batteryTypeStr = value.batteryType === 1 ? \"Alkaline\" : \"Lithium\";\n                // Period in seconds to read the sensor. 0 = Disabled\n                value.readSensorPeriod = payload[idx++] * 256 + payload[idx++];\n                // Number of readings to aggregate before sending on LoRa\n                //value.sensorAggregate = payload[idx++];\n                value.sensorAggregate = payload[idx++];\n                value.temperatureAlarmEnabled = payload[idx++] === 0 ? false : true;\n                value.humidityAlarmEnabled = payload[idx++] === 0 ? false : true;\n                break;\n            case MSGTYPE_SendFWVersion:  // handle the simpleConfig message \n                value.fw_date = payload[idx++] + \"\" + payload[idx++] + \"\" + payload[idx++];\n                value.fw_version = payload[idx++] + \".\" + payload[idx++];\n                value.partNumber = payload.readUInt32BE(idx);\n                break;\n            default:\n                break;\n        }\n      \n        return value;\n    }\n}\n// Convert the two byte sensor data format to a signed number\n// \n// tInt: the integer portion of the temp  \n// tDec: the fractional portion of the temp  \n// \nfunction convertTempUnits( tDec ,  tInt ){\n\n    // the integer portion is a signed two compliment value convert it to a signed number\n    if( tInt > 127 ){\n        tInt -= 256\n    }\n\n    // the fractional portion of the number is unsigned and represents the part of the temp \n    // after the base 10 decimal point\n    let t = tInt + (tDec * Math.sign(tInt)) / 100;\n    \n    // if the global flag for using degreesFahenheit is set convert the units\n    /*\n    if(global.get(\"degreesFahrenheit\")){\n        t = t * 1.8 + 32; \n    }\n    */\n    return t; \n}\n\n// message type two is an aggreegate temperature and humidity reading \n// the timestamp is the time of the last temp / rh reading in the array\nfunction handleMsgType_2( payload ) {\n\n  var alarms      = payload[idx++];\n  var backLogMsb  = payload[idx++];\n  var backLogLsb  = payload[idx++];\n  var batCapacity = payload[idx++];\n  var valueCount  = payload[idx++];\n  var timestamp   = (payload[idx++] * 256 * 256 * 256)  + (payload[idx++] * 256 * 256) + (payload[idx++] * 256) + payload[idx++];\n\n  var queuedData = [];    // array to hold the data while we are waiting to plot it \n\n  var temp; \n  var humidity;\n  var reading = {};\n\n  // queue the aggregate message temp/rh values so that we can display them over time rather than\n  // bursting them all at once \n  for (var ii = 0; ii <  valueCount; ii++){\n    let   h    = payload[idx++] / 100 + payload[idx++];\n    let t = convertTempUnits(payload[idx++] , payload[idx++] );\n    reading = { humidity: h, temp: t}\n    queuedData.push(reading);\n\n  } \n  \n  // loop counter for queued messages \n  ii = 0;\n\n  // timer id from the previous setInterval( ) if any\n  timerId = flow.get('timerId');\n  \n  // if we have a current setInterval, free it\n  if(timerId){\n     clearInterval(timerId);\n  }\n\n  // this is the setInterval( ) callback function \n  function  sendData() {\n    var msg = {payload:queuedData[ii]};\n    if(ii < valueCount)\n    {\n      msg.humidity = queuedData[ii].humidity;\n      msg.temp = queuedData[ii].temp;\n      msg.batCapacity = batCapacity;\n      node.send(msg);\n      ii++;\n    }\n }\n\n // send once as soon as we get data \n sendData();\n\n // if we don't have a specified read interval use something \n var interval = flow.get('readPeriod') || 5000;\n\n // set up the rest of the data to be sent at the read interval \n timerId = setInterval(sendData, interval);\n\n // save the timer id so we can cancel this scheduled repeat when we get more data \n flow.set('timerId', timerId); \n\n}\n\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"LAIRD_TH\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = Laird_Sentrius_RS_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 510,
        "y": 400,
        "wires": [
            [
                "e25c08c8.58a218"
            ]
        ]
    },
    {
        "id": "3b1e7e90.6689d2",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Adeunis Pulse",
        "func": "\nfunction decodeUp(o,payload) {\n    o.type='pulse';\n    o.pulse0=payload.readInt32LE(3);\n    o.pulse1=payload.readInt32LE(8);\n}\n\n\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ADEUNIS_PULSE\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = {};\ndecodeUp(o,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 520,
        "y": 520,
        "wires": [
            [
                "f790eef1.c57548"
            ]
        ]
    },
    {
        "id": "fa71b998.195b8",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Adeunis Sensor",
        "func": "\nAdeunisRF_ARF8045_Sensor_Payload = {\n\n\t'getChannelTypeStr': function (type) {\n\t\tswitch(type) {\n    \tcase 0:\n        \treturn \"Sensor switch / Pulse none\";\n\t        break;\n    \tcase 1:\n        \treturn \"Sensor analog, auto mode (0/10V or 4/20mA)\";\n\t        break;\n    \tcase 2:\n        \treturn \"Sensor Dry Contact\";\n\t        break;\n    \tcase 10:\n        \treturn \"Sensor temperature\";\n\t        break;\n    \tcase 11:\n        \treturn \"Sensor 4-20 mA\";\n\t        break;\n    \tcase 12:\n        \treturn \"Sensor 0-10V\";\n\t        break;\n\t    default:\n\t        return undefined;\n\t    }\n\t},\n\n\t'getChannelTypeName': function (type) {\n\t\tswitch(type) {\n    \tcase 0:\n        \treturn \"switch\";\n\t        break;\n    \tcase 1:\n        \treturn \"analog\";\n\t        break;\n    \tcase 2:\n        \treturn \"contact\";\n\t        break;\n    \tcase 10:\n        \treturn \"temperature\";\n\t        break;\n    \tcase 11:\n        \treturn \"current\";\n\t        break;\n    \tcase 12:\n        \treturn \"voltage\";\n\t        break;\n\t    default:\n\t        return undefined;\n\t    }\n\t},\n\n\n    'decodeUp': function (port,payload) {\n\t    var value = {};\n\n    \t// TODO check port\n\n\t\t// cf 4.1.1\n\n    \tvar p = payload;\n\n    \t// check length : must be 12-byte long.\n    \tvar code \t\t= p[0];\n\t    value[\"code\"] = code;\n\n\t    var status \t\t= p[1];\n\t    var error\t\t= status & 0x0F;\n\n\t    if(error === 0) {\n\n\t\t} else if((error & 0x01) !== 0) {\n\t\t    value[\"configurationdone\"] \t\t\t= true;\n\t\t} else if((error & 0x02) !== 0) {\n\t    \tvalue[\"lowbaterror\"]\t\t\t\t= true;\n\t\t} else if((error & 0x04) !== 0) {\n\t\t    value[\"configurationswitcherror\"] \t= true;\n\t\t} else if((error & 0x08) !== 0) {\n\t\t    value[\"hwerror\"] \t\t\t\t\t= true;\n\t\t}\n\n\t    value[\"counter\"] = status >> 4;\n\n\n    \tif(code === 0x01) {\n    \t\t// length is 10\n\t    \tvar sensor1type\t\t= p[2];\n\t    \tvar sensor1measure\t= p[3]+(p[4]<<8)+(p[5]<<16); // LSB First\n\t    \tvar sensor2type\t\t= p[6];\n\t    \tvar sensor2measure\t= p[7]+(p[8]<<8)+(p[9]<<16); // LSB First\n\n\t    \tif(sensor1type !== 0) {\n\t\t    \tvalue[\"sensor1type\"] \t\t= sensor1type;\n\t\t    \tvalue[\"sensor1typestr\"] \t= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(sensor1type);\n\t\t    \tvalue[\"sensor1measure\"] \t= sensor1measure;\n\t\t    \tvalue[AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeName(sensor1type)] \t= sensor1measure;\n\t    \t}\n\t    \tif(sensor2type !== 0) {\n\t\t    \tvalue[\"sensor2type\"] \t\t= sensor2type;\n\t\t    \tvalue[\"sensor2typestr\"] \t= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(sensor2type);\n\t\t    \tvalue[\"sensor2measure\"] \t= sensor2measure;\n\t\t    \tif(sensor1type !== sensor2type) {\n\t\t    \t\tvalue[AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeName(sensor2type)] = sensor2measure;\n\t\t    \t} else {\n\t\t    \t\t// TODO A array of sensor values\n\t\t    \t}\n\t\t    }\n    \t} else if(code === 0x03) {\n\t\t\t// length is 10\n\t    \tvar status \t\t\t\t= p[1];\n\t    \tvalue[\"status\"] \t\t= status;\n\t    \tvar devicetype \t\t\t= p[2];\n\t    \tvalue[\"devicetype\"] \t= devicetype;\n\t    \tvar transmitperiod \t\t= p[3]+(p[4]<<8); // LSB First;\n\t    \tvalue[\"transmitperiod\"] = transmitperiod;\n\t    \tvar channel\t\t \t\t= p[5];\n\t    \tvalue[\"channel\"] \t\t= channel;\n\t    \tvar channel1type \t\t= p[6];\n\t    \tvalue[\"channel1type\"] \t= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(channel1type);\n\t    \tvar channel2type \t\t= p[7];\n\t    \tvalue[\"channel2type\"] \t= AdeunisRF_ARF8045_Sensor_Payload.getChannelTypeStr(channel2type);\n\t    \tvar pulseinputtype\t\t= p[8];\n\t    \tvalue[\"pulseinputtype\"] = pulseinputtype;\n\t    \tvar memoswitch\t\t\t= p[9];\n\t    \tvalue[\"memoswitch\"] \t= memoswitch;\n\n    \t} else if(code === 0x00) {\n\t\t\t// length is 12\n    \t\t// Reserved\n\t    \tvar status \t\t\t\t= p[1];\n\t    \tvalue[\"status\"] \t\t= status;\n\n    \t}\n\t    return value;\n\t}\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ADEUNIS_SENSOR\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = AdeunisRF_ARF8045_Sensor_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 530,
        "y": 580,
        "wires": [
            [
                "75ddc884.6e1f6"
            ]
        ]
    },
    {
        "id": "92d78a6.a60eb78",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode 1M2M ED1608",
        "func": "\n/*\n\nThe payloads can be decrypted via the 1M2M Payload decoding JSON service\nhttp://1m2m.eu/services/GETPAYLOAD?Human=0&PL=0102096100064f7a3c07a50300000000\nhttp://1m2m.eu/services/GETPAYLOAD?Human=0&PL=0102086100064f7a3c07a50500000000\n\nhttp://1m2m.eu/services/GETPAYLOAD?Human=0&PL=0200E5CC05052900000C000000000000\n{\n  \"MsgID\":\"GenSens\",\n  \"BaromBar\":\"158828\",\n  \"Temp\":\"12.85\",\n  \"Humidity\":\"41\",\n  \"LevelX\":\"0\",\n  \"LevelY\":\"0\",\n  \"LevelZ\":\"12\",\n  \"VibAmp\":\"0\",\n  \"VibFreq\":\"0\"\n}\n\n16.3.1 Gateway GPS coordinate:1 InfoDesc = 0, 1 or 2\n2 For InfoDesc = 0 ,1 or 2, the content of the Info field encodes the GPS coordinates of the\n3 antenna broadcasting the beacon\nSize (bytes) 3 3\nInfo Lat Lng\n4 The latitude and longitude fields (Lat and Lng, respectively) encode the geographical\n5 location of the gateway as follows:\n6 • The north-­south latitude is encoded using a signed 24 bit word where -­223\n7 corresponds to 90° south (the South Pole) and 223 corresponds to 90° north (the\n8 North Pole). The equator corresponds to 0.\n9 • The east-­west longitude is encoded using a signed 24 bit word where -­\n10 223corresponds to 180° west and 223 corresponds to 180° east. The Greenwich\n11 meridian corresponds to 0.\n\n\t\n{\n  \"MsgID\":\"MovingFix\",\n  \"DevType\":\"4221455\",\n  \"Temp\":\"24.0\",\n  \"FixAge\":\"0\",\n  \"SatInFix\":\"6\",\n  \"Lat\":\"52.08636\",\n  \"Lon\":\"5.00995\",\n  \"Addr\":\"B:Korne 7, 3453 MJ De Meern, Netherlands\"\n}\n\nMsgIDAlive MsgID 0x00\nMsgIDTracking MsgID 0x01\nMsgIDGenSens MsgID 0x02\nMsgIDRot MsgID 0x03\nMsgIDAlarm MsgID 0x04\nMsgID1WireT MsgID 0x06\nMsgIDRunning MsgID 0x07\nMsgIDVibrate MsgID 0x08\nMsgIDAnalog MsgID 0x09\nMsgIDReboot MsgID 0x0E\n\n\ntypedef struct {\n\tbyte MsgId; // Message Identification Value = 0x00\n\tbyte MessageFormat; // For internal use\n\tuint8 Profile; // For internal use\n\tuint8 CmdAck; // Sequence number of last received Command\n\tbyte GPSFixAge; // bit 0..7 = Age of last GPS Fix in Minutes MsgIDsee above),\n\tbyte SatCnt_HiLL; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26\n\tbyte Lat[3]; // bit 0..23 = latitude bit 0..23\n\tbyte Lon[3]; // bit 0..23 = longitude bit 0..23\n\tbyte Battery; // 0..255 == 2,5V…3.5V == 0%..100%\n}TAliveMsg;\n\n01 02 0861 00 06 4f7a3c 07a503 00000000\n\ntypedef struct {\n\tbyte MsgId; // Message Identification Value = 0x01\n\tunsigned int Start :1; // Start Message\n\tunsigned int Move :1; // Object Moving\n\tunsigned int Stop :1; // Object Stopped\n\tunsigned int Vibr :1; // Vibration Detected\n\tint16 Temp; // Temperature in 0,01 degC\n\tbyte GPSFixAge; // bit 0..7 = Age of last GPS Fix in Minutes,\n\tbyte SatCnt_HiLL; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26\n\tbyte Lat[3]; // bit 0..23 = latitude bit 0..23\n\tbyte Lon[3]; // bit 0..23 = longitude bit 0..23\n}TTrackMsg;\n\ntypedef struct {\n\tbyte MsgId; // Message Identification Value = 0x02\n\tbyte Status; // Content Depends on Message ID ==for future use\n\tword BaromBar; // Air Pressure in mBar = MsgIDMsgIDBaromBar +100.000)/10)\n\tint16 Temp; // in 0,01 degC\n\tbyte Humidity; // Relative Humidity in %\n\tint8 LevelX; // Inverse Sinus of Beam Level in Deg X-Direction -128 = -90 Degr .. +127 = +90 Degr\n\tint8 LevelY; // Inverse Sinus of Beam Level in Deg Y-Direction -128 = -90 Degr .. +127 = +90 Degr\n\tint8 LevelZ; // Inverse Sinus of Beam Level in Deg Z-Direction -128 = -90 Degr .. +127 = +90 Degr\n\tuint8 VibAmp; // Amplitude of Vibration Detected == Future\n\tuint8 VibFreq; // Approx. Frequency of Vibration Detected in Hz\n\t// Future\n}TGenSensMsg;\n\n\n\ntypedef struct {\n\tbyte MsgId; // Message Identification Value = 0x03\n\tunsigned int GravRotAl :1; // Mag Rotation Detected\n\tunsigned int MagRot :1; // Gravity Rotation Detected\n\tint8 GravX; // Gravity in X-Direction 64 ~~ 1G\n\tint8 GravY; // Gravity in Y-Direction 64 ~~ 1G\n\tint8 GravZ; // Gravity in Z-Direction 64 ~~ 1G\n\tint8 MagX; // Magnetic Field in X-direction 10 uTesla\n\tint8 MagY; // Magnetic Field in Y-direction 10 uTesla\n\tint8 MagZ; // Magnetic Field in Z-direction 10 uTesla\n}TRotMsg;\n\ntypedef struct {\n\tbyte MsgID; // Message Identification Value = 0x04\n\tunsigned int GravRotAl :1; // Gravity Rotation Detected\n\tunsigned int MagRot :1; // Magnetic Rotation Detected\n\tunsigned int MotAlarm :1; // Motion Alarm detected\n\tunsigned int GeoFenceAl:1 // GeoFence Violation Detected\n\tunsigned int VibrAl :1; // Vibration Alarm Detected\n\tint16 Temp; // Temperature in 0,01 Celcius\n\tbyte Hum; // Relative Humidity in %\n\tword BaromBar; // Air Pressure in Mbar=MsgIDMsgIDBaromBar +100.000)/10) }TAlarmMsg;\n\tTypedef struct {\n\tbyte MsgID; // Message Identification Value = 0x06\n\tbyte NumOfSensors; // Number of 1Wire sensors currently connected\n\tword Temp[5]; // Store for temperatures\n\t// bit 0..11 Temperature in 0,1 Celcius + 550\n\t// Temperature range 0 = -55.0C, 1800 = 125.0C\n\t// bit 13..16 ShortID (0..15)\n}T1WireTMsg;\n\ntypedef struct {\n\tbyte MsgID; // Message Identification Value = 0x08\n\tbyte MaxdX; // Maximum deviation in AccelerometerX\n\tbyte MaxdY; // Maximum deviation in AccelerometerY\n\tbyte MaxxZ; // Maximum deviation in AccelerometerZ\n\tbyte Max1Freq; // Frequency with highest amplitude\n\tbyte Max1Ampl; // Amplitude of Frequency with highest Amplitude\n\tbyte Max2Freq; // Frequency with second highest amplitude\n\tbyte Max2Ampl; // Amplitude of Frequency with second highest Amplitude\n\tbyte Max3Freq; // Frequency with third highest amplitude\n\tbyte Max3Ampl; // Amplitude of Frequency with third highest Amplitude\n\tbyte vAgcVibr; // Gain Value Vibration Detection\n}TVibrMsg;\n\n\ntypedef struct {\n\tbyte MsgID; // Message Identification Value = 0x09\n\tint16 VBat; // Battery voltage in mV\n\tint16 AnalogIn1; // AnalogIn 1 in mV\n\tint16 AnalogIn2; // AnalogIn 2 in mV\n\tint16 AnalogIn3; // future use\n\tint16 Analogin4; // future use\n}TAnalogMsg;\n\ntypedef struct {\n\tbyte MsgId; // Message Identification Value = 0x0E\n\tbyte RebootReason; // For internal use\n\tuint8 Profile; // For internal use\n\tuint8 CmdAck; // Last received Command\n\tdword 1M2MID; // 1M2M Serial number\n\tbyte SrcID; // Reboot reason source file ID incl. reboot reason\n\tword LineNR; // Reboot reason line number\n}TReboot;\n*/\n\n\n\nconst MsgIDAlive = 0x00;\nconst MsgIDTracking =  0x01;\nconst MsgIDGenSens =  0x02;\nconst MsgIDRot =  0x03;\nconst MsgIDAlarm =  0x04;\nconst MsgID1WireT =  0x06;\nconst MsgIDRunning =  0x07;\nconst MsgIDVibrate =  0x08;\nconst MsgIDAnalog =  0x09;\nconst MsgIDReboot =  0x0E;\n\nOneM2M_ED1608Full_Payload = {\n\n\n\t'getDegree' : function (payload, pos, maxDeg) {\n\t    // payload is a baffer containing 3 bytes (signed 24b integer) at position pos\n\t    // maxDeg is 90 for latitude and 180 for longitude\n\n\t    var val = payload[pos+0]<<16 + payload[pos+1]<<8 + payload[pos+2]; // BE or LE\n\t    res = (val/10000.0);\n\n\t    return res;\n\t},\n\n\n    'decodeUp': function (port,payload) {\n\n\t\t//console.log(\"OneM2M_ED1608Full_Payload decodeUp\", port,payload.toString('hex'));\n\n\t\tvar value = {};\n\n    \t// TODO check port\n\n\t\t// cf 4.1.1\n\n    \tvar p = payload; \n\n    \t// check length : must be 12-byte long.\n    \tvar msgId \t\t= p[0];\n\t    value[\"msgId\"] = msgId;\n\n\t    switch (msgId) {\n\t\t    case MsgIDAlive:\n\t\t        value[\"_sub\"] = \"alive\";\n\t\t\t\tvalue[\"cmdack\"] \t\t= payload.readUInt8(3); \n\t\t\t\tvalue[\"gpsfixage\"] \t\t= payload.readUInt8(4); // bit 0..7 = Age of last GPS Fix in Minutes,\n\t\t\t\tvar satcnthill = payload.readUInt8(5);\t\t\t\t\n\t\t\t\tvalue[\"satcnthill\"] \t= {\n\t\t\t\t\t\t\t\t\t\t\t\tsatinfix : satcnthill & 0x1F,\n\t\t\t\t\t\t\t\t\t\t\t\tlatitude : satcnthill & 0x20,\n\t\t\t\t\t\t\t\t\t\t\t\tlongitude : satcnthill & 0xC0,\n\t\t\t\t\t\t\t\t\t\t}; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26\n\t\t\t\tvalue[\"lati\"] = OneM2M_ED1608Full_Payload.getDegree(p, 6);\t// byte Lat[3]; // bit 0..23 = latitude bit 0..23\n\t\t\t\tvalue[\"long\"] = OneM2M_ED1608Full_Payload.getDegree(p, 9); // byte Lat[3]; // bit 0..23 = latitude bit 0..23\n\t\t\t\tvalue[\"batteryLevel\"] \t= payload.readUInt8(12)*100/255; \t// 0..255 == 2,5V…3.5V == 0%..100%\t\t\t\n\n\t\t        break;\n\t\t    case MsgIDTracking:\n\t\t        value[\"_sub\"] = \"tracking\";\n\t\t        var _type = payload.readUInt8(1);\n\t\t        value[\"type\"] = (_type&0x01) ? \"start\" :  (_type&0x02) ? \"move\" : (_type&0x04) ? \"stop\" : (_type&0x08) ? \"vibr\" : undefined;\n\t\t        value[\"temperature\"] \t= payload.readInt16BE(3) / 100;  // in 0,01 degC\n\t\t        value[\"gpsfixage\"] \t\t= payload.readUInt8(4); // bit 0..7 = Age of last GPS Fix in Minutes,\n\t\t        var satcnthill = payload.readUInt8(5);\t\t\t\t\n\t\t\t\tvalue[\"satcnthill\"] \t= {\n\t\t\t\t\t\t\t\t\t\t\t\tsatinfix : satcnthill & 0x1F,\n\t\t\t\t\t\t\t\t\t\t\t\tlatitude : satcnthill & 0x20,\n\t\t\t\t\t\t\t\t\t\t\t\tlongitude : satcnthill & 0xC0,\n\t\t\t\t\t\t\t\t\t\t}; // bit 0..4 = SatInFix, bit5 Latitude 25 bit 6,7 = Longitude 25,26\n\t\t\t\tvalue[\"lati\"] = OneM2M_ED1608Full_Payload.getDegree(p, 6);\t// byte Lat[3]; // bit 0..23 = latitude bit 0..23\n\t\t\t\tvalue[\"long\"] = OneM2M_ED1608Full_Payload.getDegree(p, 9); // byte Lat[3]; // bit 0..23 = latitude bit 0..23\n\n\t\t        break;\n\t\t    case MsgIDGenSens:\n\t\t        value[\"_sub\"] = \"gensens\";\n\n\t\t\t\tvalue[\"pressure\"] \t= \tMath.round(((100000 + payload.readInt16BE(2))/100)); \t// Air Pressure in mBar = ( MsgIDMsgIDBaromBar +100000 )/100)    should be converted in hPa.\n\n\t\t\t\tvalue[\"temperature\"] \t= payload.readInt16BE(4) / 100; \t\t\t// in 0,01 degC\n\t\t\t\tvalue[\"humidity\"] \t\t= payload.readUInt8(6); \t\t\t\t\t// Relative Humidity in %\n\t\t\t\tvalue[\"levelx\"] \t\t= payload.readInt8(7); \t\t\t\t\t\t// Inverse Sinus of Beam Level in Deg X-Direction -128 = -90 Degr .. +127 = +90 Degr\n\t\t\t\tvalue[\"levely\"] \t\t= payload.readInt8(8); \t\t\t\t\t\t// Inverse Sinus of Beam Level in Deg Y-Direction -128 = -90 Degr .. +127 = +90 Degr\n\t\t\t\tvalue[\"levelz\"] \t\t= payload.readInt8(9); \t\t\t\t\t\t// Inverse Sinus of Beam Level in Deg Z-Direction -128 = -90 Degr .. +127 = +90 Degr\n\t\t\t\tvalue[\"vibamp\"] \t\t= payload.readUInt8(10); \t\t\t\t\t// Amplitude of Vibration Detected\n\t\t\t\tvalue[\"vibfreq\"] \t\t= payload.readUInt8(11); \t\t\t\t\t// Approx. Frequency of Vibration Detected in Hz\n\n\t\t        break;\n\t\t   \n\t\t    case MsgIDAlarm:\n\t\t        value[\"_sub\"] = \"alarm\";\n\t\t        // TODO\n\t\t        break;\n\t\t    case MsgID1WireT:\n\t\t        value[\"_sub\"] = \"1wiret\";\n\t\t        // TODO\n\t\t        break;\n\t\t    case MsgIDRunning:\n\t\t        value[\"_sub\"] = \"running\";\n\t\t        // TODO\n\t\t        break;\n\t\t    case MsgIDVibrate:\n\t\t        value[\"_sub\"] = \"vibrate\";\n\t\t        // TODO\n\t\t        break;\n\t\t    case MsgIDAnalog:\n\t\t        value[\"_sub\"] = \"analog\";\n\t\t        // TODO\n\t\t        break;\n\t\t    case MsgIDReboot:\n\t\t        value[\"_sub\"] = \"reboot\";\n\t\t        // TODO\n\t\t        break;\n\t\t    default:\n\t\t        value[\"_sub\"] = \"unknown\";\n\t\t        // TODO\n\t\t} \n\n\t\t//console.log(\"OneM2M_ED1608Full_Payload decodeUp value:\", value);\n\n\t    return value;\n\t}\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ONEM2M_ED1608\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = OneM2M_ED1608Full_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 530,
        "y": 640,
        "wires": [
            [
                "e5c4760c.e1dc28",
                "afb54073.becdf"
            ]
        ]
    },
    {
        "id": "41cd83dd.2aa08c",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode RisingHF WSA 3X",
        "func": "RisingHF_WS1TH_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port\n    \tvar value =  {};\n\n\t\t/*\n\t\t3.2.1 Header\n\t\tD7: Toggle when receive a downlink.\n\t\tD6: Current status. When door sensor status changed, this bit would be changed also and trigger a transmit.\n\t\tD5~D2: Reserved.\n\t\tD1~D0: Header type, 1: normal, others: reserved.\n\t\t*/\n        var _header = payload.readUInt8(0);\n        value[\"header\"] = _header;\n\n\t\t/*\n\t\t3.2.2 Temperature Get payload 6c 68(little endian), convert to HEX format 0x686c, it is 26732 in decimal. Use formula below to calculate. ℃\n\t\tt=26732 (0x686C), then T=24.8℃.\n\t\t*/\n        var _temperature = payload.readInt16LE(1);\n        value[\"temperature\"] = ((175.72*_temperature)/(Math.pow(2, 16)) - 46.85);\n\n\t\t/*\n\t\t3.2.3 Humidity Get payload 9d, convert to HEX format 0x9d, it is 157 in decimal. Use formula below to calculate.\n\t\trh=157 (0x9d), then RH=71% Note: The Humidity would be reserved in future product if no need in future.\n\t\t*/\n        var _humidity = payload.readUInt8(3);\n        value[\"humidity\"] = ((125*_humidity)/256 - 6);\n\n\t\t/*\n\t\t3.2.4 Period Get payload 30 00(little endian), convert to HEX format 0x0030, it is 48 in decimal, the unit is 2s. So the period is 96s. Note: LoRaWAN is an Aloha protocol, the real transmitting period will have a random offset each time, random offset default value -10 ~ 10s, read device configuration through RCFG tool to know the exact value.\n\t\t*/\n        var _period = payload.readUInt16LE(4); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"period\"] = _period * 2;\n\n\t\t/*\n\t\t3.2.5 RSSI & SNR\n\t\tRSSI and SNR of last received payload, 0xFF means RHF1Sxxx never gets downlink and RSSI/SNR is unknown, server could use this information to estimate downlink link budget.\n\t\tFormula:\n\t\tFrom the example:\n\t\tRSSI is 0x90, SNR is 0x29. RSSI = -180+144 = -36dBm; SNR = 41/4 =\n\t\t*/\n        var _rssi = payload.readUInt8(6); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"rssi\"] = (_rssi - 180);\n\n        var _snr = payload.readUInt8(7); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"snr\"] = (((_snr ^ 0xFF)+1) /4.0);\n\n\t\t/*\n\t\t3.2.6 Battery level Battery voltage level unit is 0.01V. Get payload C8, covert to decimal 200.\n\t\tIn prototype, no battery is used. So the voltage level would be always same which is the level of regulator output.\n\n\t\tC8 means battery level is 3.5V Note: Battery percentage value is to be defined.\n\t\t*/\n        var _battery = payload.readInt8(8);\n        //value[\"batteryLevel\"] = (_battery + 150) * 0.01;\n        value[\"batteryLevel\"] = (((_battery + 150) * 0.01) * 100);\n\n    \treturn value;\n    }\n}\n\n\nRisingHF_WSA_3X_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port \n\t\t// port is 8\n\n    \tvar value =  {};\n\t\t/*\n\t\tFirst 2 BE bytes are for x-axis, mid 2 BE bytes are for y-axis, last 2 BE bytes are for z-axis.\n\t\tAcceleration Conversion: (g is acceleration of gravity, ~9.8m/s2)\n\t\tAXs = 0x0038 -> AX = AXs/256 * g -> AX = 0x38/256 g = 0.22g\n\t\tAYs = 0x0084 -> AY = AYs/256 * g -> AY = 0x84/256 g =0.52g\n\t\tAZs = 0x00d2 -> AZ = AZs/256 * g -> AZ = 0xd2/256 g = 0.82g\n\t\t*/\n        var _accx = payload.readInt16BE(0) / 256.0; // in g\n        value[\"accx\"] = _accx;\n\n        var _accy = payload.readInt16BE(2) / 256.0; // in g\n        value[\"accy\"] = _accy;\n\n        var _accz = payload.readInt16BE(4) / 256.0; // in g\n        value[\"accz\"] = _accz;\n\n    \tvar threshold = 1; // TODO should be paramaterable\n\n    \tconsole.log(\"Acceleration : \",_accx,_accy,_accz);\n\n    \t//value[\"presence\"] = (Math.abs(_accx) > threshold) || (Math.abs(_accy) > threshold) || (Math.abs(_accz) > threshold);\n    \t//value[\"motion\"] = (Math.abs(_accx) > threshold) || (Math.abs(_accy) > threshold) || (Math.abs(_accz) > threshold);\n    \t//value[\"motion\"] = true;\n\n    \treturn value;\n    }\n}\n\n// TODO : MUST BE TESTED\nRisingHF_WSA_Flame_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port \n\n\t\t// port is 8\n\n    \tvar value =  {};\n\t\t/*\n\t\tAW-WSA Flame sensor returns 1 byte payload each packet. For example:\n\t\t01\n\t\t00 -> Normal\n\t\t01 -> Flame is detected\n\t\t*/\n        var _flame = payload.readInt8(0); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"flame\"] = (_flame === 1);\n\n    \treturn value;\n    }\n}\n\nRisingHF_WSA_InfraredTemperature_Payload = {\n    'decode': function (port,payload) {\n    \t// TODO check port \n\n\t\t// port is 8\n\n    \tvar value =  {};\n\t\t/*\n\t\t4.4 Infrared Temperature\n\t\tAW-WSA Infrared sensor returns 2 bytes payload each packet. For example:\n\t\t09 1f\n\t\tTemperature Conversion:\n\t\tTs = 0x091f -> T = Ts/100 -> T = 0x091f/100 -> T = 2335/100= 23.5°\n\t\t*/\n        var _temperature = payload.readInt16BE(0); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"temperature\"] = _temperature/100.0;\n\n    \treturn value;\n    }\n}\n\n// TODO : MUST BE TESTED\nRisingHF_WSA_TemperatureHumidity_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port \n\n\t\t// port is 8\n\n    \tvar value =  {};\n\t\t/*\n\t\t4.1 Temperature and Humidity\n\t\tAW-WSA temperature and humidity sensor returns 4 bytes payload each packet. For\n\t\texample:\n\t\t09 0c 06 2e\n\t\tFirst 2 bytes are for temperature, last 2 bytes are for humidity.\n\t\tTemperature Conversion:\n\t\tTs = 0x090c -> T = Ts/32 - 50 -> T = 0x090c/32 - 50 -> T = 2316/32 - 50 = 22.4°\n\t\tHumidity Conversion:\n\t\tRHs = 0x062e -> 100RH = RHs/16-24 -> 100RH = 0x062e/16-24=74.9 -> RH = 74.9%\n\t\t*/\n        var _temperature = payload.readInt16BE(0);  // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"temperature\"] = _temperature/32.0 - 50;\n\n        var _humidity = payload.readInt16BE(2); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"humidity\"] = _humidity/16.0 - 24;\n\n    \treturn value;\n    }\n}\n\n// TODO : MUST BE TESTED\nRisingHF_WSA_Light_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port \n\n\t\t// port is 8\n\n    \tvar value =  {};\n\t\t/*\n\t\t4.2 Light\n\t\tAW-WSA Light sensor returns 4 bytes payload each packet. For example:\n\t\t00 00 00 27\n\t\tIlluminance:\n\t\tEs = 0x00000027 -> E=Es lx -> E=39lx\n\t\t*/\n        var _light = payload.readInt32BE(0); // TODO : CHECK SIGNED OR UNSIGNED\n        value[\"light\"] = _light;\n\n    \treturn value;\n    }\n}\n\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"RHF_WSA3X\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = RisingHF_WSA_3X_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 540,
        "y": 700,
        "wires": [
            [
                "b5cab10a.f68738"
            ]
        ]
    },
    {
        "id": "e25c08c8.58a218",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "laird_th",
        "links": [
            "8cf04345.eb5b2",
            "89964c81.0ebf5"
        ],
        "x": 835,
        "y": 400,
        "wires": []
    },
    {
        "id": "708abecd.9d5248",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "semtech_loramote",
        "links": [
            "ed88aa21.0008c"
        ],
        "x": 835,
        "y": 340,
        "wires": []
    },
    {
        "id": "4284d05.b9b56b",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "adeunis_temp",
        "links": [
            "942ada33.e946c8"
        ],
        "x": 835,
        "y": 460,
        "wires": []
    },
    {
        "id": "f790eef1.c57548",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "adeunis_pulse",
        "links": [
            "7c9f9230.457a74"
        ],
        "x": 835,
        "y": 520,
        "wires": []
    },
    {
        "id": "75ddc884.6e1f6",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "adeunis_sensor",
        "links": [
            "27f9dba9.9e183c"
        ],
        "x": 835,
        "y": 580,
        "wires": []
    },
    {
        "id": "e5c4760c.e1dc28",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "1m2m_ed1608",
        "links": [
            "d63bb7d1.f79ea8"
        ],
        "x": 835,
        "y": 640,
        "wires": []
    },
    {
        "id": "b5cab10a.f68738",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "rhf_wxa3",
        "links": [],
        "x": 835,
        "y": 700,
        "wires": []
    },
    {
        "id": "e7df8e01.4ddc68",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "adeunis_ftd",
        "links": [
            "c11e696c.b82488"
        ],
        "x": 835,
        "y": 280,
        "wires": []
    },
    {
        "id": "a0339945.fda27",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "adeunis_demomote",
        "links": [
            "7b15e2af.57881c",
            "ba668dfc.83e628"
        ],
        "x": 835,
        "y": 220,
        "wires": []
    },
    {
        "id": "8eaa1326.d23828",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode SensingLabs SenlabH",
        "func": "\nSensingLabs_SenlabH_Payload = {\n    'decodeUp': function (port,payload) {\n    \t// TODO check port \n\n\t\t// port is 3\n\n    \tvar value =  {};\n\n    \tvar len = payload.length;\n\n\t\t//var _id = payload.readInt8(0);\n        //value[\"id\"] === 0x03;\n\n\t\t// the battery level expressed in 1/254 %\n\t\tvar _battery = payload.readUInt8(1);\n        value[\"batteryLevel\"] = ((_battery * (1/254.0))*100);\n\n        // \ttemperature expressed in 1/16 °C as a 2 bytes signed int\n\t\tvar _temperature = payload.readInt16BE(len-3);\n        value[\"temperature\"] = (_temperature * (1/16.0));\n\n\n        //  humidity expressed in % as 8bits signed int [0-100%]\n\t\tvar _humidity = payload.readInt8(len-1);\n        value[\"humidity\"] = (_humidity);\n\n    \treturn value;\n\t}\n}\n\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"SENLAB_H\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = SensingLabs_SenlabH_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 550,
        "y": 760,
        "wires": [
            [
                "bb5290d6.3bc658"
            ]
        ]
    },
    {
        "id": "bb5290d6.3bc658",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "sensinglab_senlabh",
        "links": [],
        "x": 835,
        "y": 760,
        "wires": []
    },
    {
        "id": "aedd2557.ffe26",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode ASCOELIT CM868LRTH",
        "func": "\n// Fake value\nASCOELIT_Generic_Payload = {\n\n    'setBattery': function (value,_bat) {\n        /*\n        BATTERY Unsigned char (8 bits) Report type and percentage of battery level\n        EVENT Unsigned char (8 bits) Event flag. See below\n        OPCNT Unsigned char (16 bits) Total number of detections\n        */\n        var isLithium = ((_bat & 0x80) !== 0);\n        value[\"batteryType\"] = isLithium ? \"3.6V Lithium-thionyl\" : \"3.0V Alkaline Battery\";\n        var _batteryLevel = (_bat & 0x7F);\n        value[\"batteryLevel\"] = _batteryLevel;\n\n        const Batt_LOW_LVL = 2100;\n        const Batt_HIGH_LVL = isLithium ? 3600 : 3000;\n\n        // TODO : One parenthesis was missing : check the value\n        value[\"batteryVoltage\"] = (Batt_LOW_LVL + ((Batt_HIGH_LVL - Batt_LOW_LVL) * _batteryLevel) / 100);\n\n        /*\n        TODO\n        Batt_LOW_LVL + (((Batt_HIGH_LVL - Batt_LOW_LVL) * percentage)) / 100)\n        Where:\n        Batt_LOW_LVL = 2100mV\n        Batt_HIGH_LVL = 3000mV if battery type is Alkaline\n        Batt_HIGH_LVL = 3600mV if battery type is Lithium-thionyl\n        Percentage = the value of bit [6:0] (cannot have the value 0)\n        */\n    },\n\n\n    'setGeneric': function (port,payload,value) {\n\n        const PORT_Presentation=5;\n        const PORT_Serial_Number=6;\n        const PORT_ReleaseInfo=7;\n        const PORT_BatteryLevel=8\n        const PORT_ACK=10;\n\n        switch(port) {\n            case PORT_Presentation: // GENERIC\n                {\n                    value[\"model\"] = payload.toString();\n                }\n                break;\n            case PORT_Serial_Number: // GENERIC\n                {\n                    if(payload.length !== 8) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    value[\"sn\"] = true;\n                }\n                break;\n            case PORT_ReleaseInfo: // GENERIC\n                {\n                    if(payload.length !== 11) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    value[\"release\"] = payload.toString();\n                }\n                break;\n            case PORT_BatteryLevel: // GENERIC\n                {\n                    if(payload.length !== 1) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n                }\n                break;\n            case PORT_ACK: // GENERIC\n                {\n                    /*\n                    ACK/NACK\n                    3 bytes Char <ACK> and 4 bytes Char <NACK>)\n                    Acknowledgement signal sent by the sensor to server. It can be ACK or NACK depending whether or\n                    not the message received from the server is fine. It also specifies on which protocol port the message\n                    has been received from the server. This message is sent every time the sensor receive a setting\n                    message from the server on ports 9, 11, 12 and 13\n                    */\n                    value[\"ack\"] = true;\n                }\n                break;\n            default: // GENERIC\n                value[\"decoding_error\"] = \"Unknown port\";\n        }\n\n    }\n}\n\n\nASCOELIT_IR868LR_Payload = {\n    // private method\n\n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x01) !== 0);\n        value[\"tamper\"] = ((_event & 0x02) !== 0);\n        value[\"intrusion\"] = ((_event & 0x04) !== 0);\n    },\n\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=20;\n\n        var value = {};\n\n        value.op = \"merge\";\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 4) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n\n                    setEvent(value,payload.readInt8(1));\n\n                    value[\"opCnt\"] = payload.readInt16BE(2); // TODO BE ou LE ???\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 3) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n\n                    value[\"opCnt\"] = payload.readInt16BE(1); // TODO BE ou LE ???\n                }\n                break;\n            default:\n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n\n        }\n        return value;\n    }\n\n}\n\n\nASCOELIT_PB868LRH_Payload = {\n\n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x04) !== 0);\n        value[\"push\"] = ((_event & 0x01) !== 0);\n    },\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=30;\n\n        // TODO check port\n        var value = {};\n\n        value.op = \"merge\";\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 10) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n                    setEvent(value,payload.readUInt8(1));\n                    value.temperature = payload.readFloat(2);\n                    value.humidity = payload.readFloat(6);\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 3) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n\n                    value[\"opCnt\"] = payload.readInt16BE(1); // TODO BE ou LE ???\n                }\n                break;\n            default: \n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n        }\n        return value;\n    }\n\n}\n\n\nASCOELIT_CM868LR_Payload = {\n    // \n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x01) !== 0);\n        value[\"tamper\"] = ((_event & 0x02) !== 0);\n        value[\"intrusion\"] = ((_event & 0x04) !== 0);\n    },\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=30;\n\n        var value = {};\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 10) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n\n                    setEvent(value,payload.readUInt8(1));\n\n                    value[\"temperature\"] = payload.readFloatLE(2); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(6); // TODO BE ou LE ???\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 11) {\n                        value[\"decoding_error\"] = \"Invalid length for SENSOR message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n    \n                    value[\"opCnt\"] = payload.readUInt16LE(1); // TODO BE ou LE ???\n                    value[\"temperature\"] = payload.readFloatLE(3); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(7); // TODO BE ou LE ???\n                }\n                break;\n            default:\n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n\n        }\n        return value;\n    }\n}\n\nASCOELIT_CM868LRTH_Payload = {\n    // \n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x01) !== 0);\n        value[\"tamper\"] = ((_event & 0x02) !== 0);\n        value[\"intrusion\"] = ((_event & 0x04) !== 0);\n    },\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=30;\n\n        var value = {};\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 10) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n\n                    setEvent(value,payload.readUInt8(1));\n\n                    value[\"temperature\"] = payload.readFloatLE(2); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(6); // TODO BE ou LE ???\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 11) {\n                        value[\"decoding_error\"] = \"Invalid length for SENSOR message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n    \n                    value[\"opCnt\"] = payload.readUInt16LE(1); // TODO BE ou LE ???\n                    value[\"temperature\"] = payload.readFloatLE(3); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(7); // TODO BE ou LE ???\n                }\n                break;\n            default:\n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n\n        }\n        return value;\n    }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ASCOELIT_CM868LRTH\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = ASCOELIT_CM868LRTH_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 560,
        "y": 820,
        "wires": [
            [
                "98bd1f86.d1a3b8"
            ]
        ]
    },
    {
        "id": "98bd1f86.d1a3b8",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "ascoelit_cm868lrth",
        "links": [
            "6b1bcabc.1f3b04"
        ],
        "x": 835,
        "y": 820,
        "wires": []
    },
    {
        "id": "7b07d71f.eac178",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "ascoelit_cm868lr",
        "links": [
            "dfb2edab.412778"
        ],
        "x": 835,
        "y": 880,
        "wires": []
    },
    {
        "id": "9a62db47.47ca",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode ASCOELIT CM868LR",
        "func": "\n// Fake value\nASCOELIT_Generic_Payload = {\n\n    'setBattery': function (value,_bat) {\n        /*\n        BATTERY Unsigned char (8 bits) Report type and percentage of battery level\n        EVENT Unsigned char (8 bits) Event flag. See below\n        OPCNT Unsigned char (16 bits) Total number of detections\n        */\n        var isLithium = ((_bat & 0x80) !== 0);\n        value[\"batteryType\"] = isLithium ? \"3.6V Lithium-thionyl\" : \"3.0V Alkaline Battery\";\n        var _batteryLevel = (_bat & 0x7F);\n        value[\"batteryLevel\"] = _batteryLevel;\n\n        const Batt_LOW_LVL = 2100;\n        const Batt_HIGH_LVL = isLithium ? 3600 : 3000;\n\n        // TODO : One parenthesis was missing : check the value\n        value[\"batteryVoltage\"] = (Batt_LOW_LVL + ((Batt_HIGH_LVL - Batt_LOW_LVL) * _batteryLevel) / 100);\n\n        /*\n        TODO\n        Batt_LOW_LVL + (((Batt_HIGH_LVL - Batt_LOW_LVL) * percentage)) / 100)\n        Where:\n        Batt_LOW_LVL = 2100mV\n        Batt_HIGH_LVL = 3000mV if battery type is Alkaline\n        Batt_HIGH_LVL = 3600mV if battery type is Lithium-thionyl\n        Percentage = the value of bit [6:0] (cannot have the value 0)\n        */\n    },\n\n\n    'setGeneric': function (port,payload,value) {\n\n        const PORT_Presentation=5;\n        const PORT_Serial_Number=6;\n        const PORT_ReleaseInfo=7;\n        const PORT_BatteryLevel=8\n        const PORT_ACK=10;\n\n        switch(port) {\n            case PORT_Presentation: // GENERIC\n                {\n                    value[\"model\"] = payload.toString();\n                }\n                break;\n            case PORT_Serial_Number: // GENERIC\n                {\n                    if(payload.length !== 8) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    value[\"sn\"] = true;\n                }\n                break;\n            case PORT_ReleaseInfo: // GENERIC\n                {\n                    if(payload.length !== 11) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    value[\"release\"] = payload.toString();\n                }\n                break;\n            case PORT_BatteryLevel: // GENERIC\n                {\n                    if(payload.length !== 1) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n                }\n                break;\n            case PORT_ACK: // GENERIC\n                {\n                    /*\n                    ACK/NACK\n                    3 bytes Char <ACK> and 4 bytes Char <NACK>)\n                    Acknowledgement signal sent by the sensor to server. It can be ACK or NACK depending whether or\n                    not the message received from the server is fine. It also specifies on which protocol port the message\n                    has been received from the server. This message is sent every time the sensor receive a setting\n                    message from the server on ports 9, 11, 12 and 13\n                    */\n                    value[\"ack\"] = true;\n                }\n                break;\n            default: // GENERIC\n                value[\"decoding_error\"] = \"Unknown port\";\n        }\n\n    }\n}\n\n\nASCOELIT_IR868LR_Payload = {\n    // private method\n\n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x01) !== 0);\n        value[\"tamper\"] = ((_event & 0x02) !== 0);\n        value[\"intrusion\"] = ((_event & 0x04) !== 0);\n    },\n\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=20;\n\n        var value = {};\n\n        value.op = \"merge\";\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 4) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n\n                    setEvent(value,payload.readInt8(1));\n\n                    value[\"opCnt\"] = payload.readInt16BE(2); // TODO BE ou LE ???\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 3) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n\n                    value[\"opCnt\"] = payload.readInt16BE(1); // TODO BE ou LE ???\n                }\n                break;\n            default:\n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n\n        }\n        return value;\n    }\n\n}\n\n\nASCOELIT_PB868LRH_Payload = {\n\n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x04) !== 0);\n        value[\"push\"] = ((_event & 0x01) !== 0);\n    },\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=30;\n\n        // TODO check port\n        var value = {};\n\n        value.op = \"merge\";\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 10) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n                    setEvent(value,payload.readUInt8(1));\n                    value.temperature = payload.readFloat(2);\n                    value.humidity = payload.readFloat(6);\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 3) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n\n                    value[\"opCnt\"] = payload.readInt16BE(1); // TODO BE ou LE ???\n                }\n                break;\n            default: \n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n        }\n        return value;\n    }\n\n}\n\n\nASCOELIT_CM868LR_Payload = {\n    // \n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x01) !== 0);\n        value[\"tamper\"] = ((_event & 0x02) !== 0);\n        value[\"intrusion\"] = ((_event & 0x04) !== 0);\n    },\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=30;\n\n        var value = {};\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 10) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n\n                    setEvent(value,payload.readUInt8(1));\n\n                    value[\"temperature\"] = payload.readFloatLE(2); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(6); // TODO BE ou LE ???\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 11) {\n                        value[\"decoding_error\"] = \"Invalid length for SENSOR message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n    \n                    value[\"opCnt\"] = payload.readUInt16LE(1); // TODO BE ou LE ???\n                    value[\"temperature\"] = payload.readFloatLE(3); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(7); // TODO BE ou LE ???\n                }\n                break;\n            default:\n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n\n        }\n        return value;\n    }\n}\n\nASCOELIT_CM868LRTH_Payload = {\n    // \n    'setEvent': function (value,_event) {\n        value[\"batteryLow\"] = ((_event & 0x01) !== 0);\n        value[\"tamper\"] = ((_event & 0x02) !== 0);\n        value[\"intrusion\"] = ((_event & 0x04) !== 0);\n    },\n\n    'decodeUp': function (port,payload) {\n\n        const PORT_Alive=9;\n        const PORT_Sensor=30;\n\n        var value = {};\n\n        switch(port) {\n            case PORT_Alive:\n                {\n                    if(payload.length !== 10) {\n                        value[\"decoding_error\"] = \"Invalid length for ALIVE message\";\n                        break;\n                    }\n                    ASCOELIT_Generic_Payload.setBattery(value,payload.readInt8(0));\n\n                    setEvent(value,payload.readUInt8(1));\n\n                    value[\"temperature\"] = payload.readFloatLE(2); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(6); // TODO BE ou LE ???\n                }\n                break;\n            case PORT_Sensor:\n                {\n                    if(payload.length !== 11) {\n                        value[\"decoding_error\"] = \"Invalid length for SENSOR message\";\n                        break;\n                    }\n\n                    setEvent(value,payload.readInt8(0));\n    \n                    value[\"opCnt\"] = payload.readUInt16LE(1); // TODO BE ou LE ???\n                    value[\"temperature\"] = payload.readFloatLE(3); // TODO BE ou LE ???\n                    value[\"humidity\"] = payload.readFloatLE(7); // TODO BE ou LE ???\n                }\n                break;\n            default:\n                ASCOELIT_Generic_Payload.setGeneric(port,payload,value);    \n\n        }\n        return value;\n    }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ASCOELIT_CM868LR\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = ASCOELIT_IR868LR_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 550,
        "y": 880,
        "wires": [
            [
                "7b07d71f.eac178"
            ]
        ]
    },
    {
        "id": "a22631e1.65139",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Allora",
        "func": "/*\nFirst we have 2 fixed bytes (length and allora message type). Next we have a\nsequence of Key-Value pairs. Not all Key-Value pairs are always transmitted in\neach message, so be flexible when you parse the payload.\nFixed:\nName # bytes Description\nLength 1 byte Number of bytes in the payload after this length byte\n(length not included in the value)\nMin. 0x00, Max 0xFF (max depends on LoRaWAN\nmaximum payload settings)\nMessage\ntype 1 byte Message type of the payload.\n0x02: report message\n0xFF: error message\n\n*/\nAllora_Pirio_Payload = {\n  'decodeUp': function (port,payload) {\n      \n      \n        const BATTERY_SHUTDOWN_LEVEL = 1900; // mV\n        const BATTERY_MIN_LEVEL = 2000; // mV\n        const BATTERY_MAX_LEVEL = 3300; // mV\n\n        const MSGTYPE_REPORT = 0x02;\n        const MSGTYPE_ERROR = 0xFF;\n      \n        const TYPE_TEMPERATURE = 0x01;\n        const TYPE_HUMIDITY = 0x02;\n        const TYPE_OCCUPANCY = 0x04;\n        const TYPE_NUM_OCCUPIED_BLOCKS = 0x05;\n        const TYPE_NUM_MOTION_EVTS = 0x06;\n        const TYPE_NUM_FREE_BLOCKS = 0x07;\n        const TYPE_RAW_MOTION_EVTS = 0x08;\n        const TYPE_BATTERY_LEVEL = 0xFE;\n        const TYPE_ERROR = 0xFF;\n\n    var value = {}\n    var p = payload;\n    var idx = 0;\n    var len = p.readUInt8(idx);\n    idx += 1;\n    var msgType = p.readUInt8(idx);\n    idx += 1;\n    \n    if(msgType === MSGTYPE_ERROR) {\n        value.error = true;\n        return value;\n    } else if(msgType !== MSGTYPE_REPORT) {\n        value.unknown_msg = true;\n        return value;\n    }\n    \n    var v;\n    while(idx < payload.length)\n    {\n        var dataType = payload[idx++];\n        //console.log(idx, \"-->\", dataType);\n        switch(dataType) {\n            case TYPE_TEMPERATURE:\n                v = payload.readInt16BE(idx) / 100.0;\n                idx += 2;\n                value.temperature = v;\n                break;\n            case TYPE_HUMIDITY:\n                v = (payload.readUInt16BE(idx) / 65536)*125 - 6;\n                idx += 2;\n                value.humidity = v;\n                break;\n            case TYPE_OCCUPANCY:\n                // 0x00 Monitored space is free\n                // 0x01 Monitored space is occupied    \n                v = payload.readUInt8(idx) !== 0 ? true : false;\n                idx += 1;\n                value.occupancy = v;\n                break;\n            case TYPE_NUM_OCCUPIED_BLOCKS:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                value.num_occupied_blocks = v;\n                break;\n            case TYPE_NUM_MOTION_EVTS:\n                v = payload.readUInt16BE(idx);\n                idx += 2;\n                value.num_motion_events = v;\n                break;\n            case TYPE_NUM_FREE_BLOCKS:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                value.num_free_blocks = v;\n                break;\n            case TYPE_RAW_MOTION_EVTS:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                value.num_motion_events = v;\n                break;\n            case TYPE_BATTERY_LEVEL:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                if(v === 0) {\n                    value.battery_level = 0;\n                    value.battery_voltage = BATTERY_SHUTDOWN_LEVEL;\n                } else if(v === 1) {\n                    value.battery_level = 1;\n                    value.battery_voltage = (BATTERY_SHUTDOWN_LEVEL + BATTERY_MIN_LEVEL) / 2;\n                }  else if(v === 254) {\n                    value.battery_level = 100;\n                    value.battery_voltage = BATTERY_MAX_LEVEL;\n                } else if(v === 255) {\n                    value.battery_level = 0;\n                    value.battery_voltage = BATTERY_SHUTDOWN_LEVEL;\n                } else {\n                    value.battery_level = ( ( 253 * ( v - BATTERY_MIN_LEVEL ) ) / ( BATTERY_MAX_LEVEL - BATTERY_MIN_LEVEL ) ) + 1;\n                    value.battery_voltage = value.battery_level * (BATTERY_MAX_LEVEL-BATTERY_MIN_LEVEL) + BATTERY_MIN_LEVEL;\n                }\n                /*\n                Type: uint8\n                Value:\n                0x00 - 0xFF\n                255: battery voltage < BATTERY_SHUTDOWN_LEVEL (1900 mV)\n                254 : battery voltage >= BATTERY_MAX_LEVEL (3300 mV)\n                253 - 2: batteryLevel = ( ( 253 * ( BatteryVoltage - BATTERY_MIN_LEVEL ) ) / ( BATTERY_MAX_LEVEL - BATTERY_MIN_LEVEL ) ) + 1;\n                1 : battery voltage between BATTERY_MIN_LEVEL (2000 mV) and BATTERY_SHUTDOWN_LEVEL (1900 mV).\n                0 : battery voltage < 1.9V\n                */\n                break;\n            default:\n                return value;\n        }\n    }\n    return value;\n  }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ALLORA_PIRIO\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = Allora_Pirio_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 500,
        "y": 940,
        "wires": [
            [
                "95acd8b1.8b49c"
            ]
        ]
    },
    {
        "id": "95acd8b1.8b49c",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "allora_pirio",
        "links": [],
        "x": 835,
        "y": 940,
        "wires": []
    },
    {
        "id": "78afa664.e3c4d",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Allora",
        "func": "/*\nFirst we have 2 fixed bytes (length and allora message type). Next we have a\nsequence of Key-Value pairs. Not all Key-Value pairs are always transmitted in\neach message, so be flexible when you parse the payload.\nFixed:\nName # bytes Description\nLength 1 byte Number of bytes in the payload after this length byte\n(length not included in the value)\nMin. 0x00, Max 0xFF (max depends on LoRaWAN\nmaximum payload settings)\nMessage\ntype 1 byte Message type of the payload.\n0x02: report message\n0xFF: error message\n\n*/\nAllora_Payload = {\n  'decodeUp': function (port,payload) {\n      \n      \n        const BATTERY_SHUTDOWN_LEVEL = 1900; // mV\n        const BATTERY_MIN_LEVEL = 2000; // mV\n        const BATTERY_MAX_LEVEL = 3300; // mV\n\n        const MSGTYPE_REPORT = 0x02;\n        const MSGTYPE_ERROR = 0xFF;\n      \n        const TYPE_TEMPERATURE = 0x01;\n        const TYPE_HUMIDITY = 0x02;\n        const TYPE_OCCUPANCY = 0x04;\n        const TYPE_NUM_OCCUPIED_BLOCKS = 0x05;\n        const TYPE_NUM_MOTION_EVTS = 0x06;\n        const TYPE_NUM_FREE_BLOCKS = 0x07;\n        const TYPE_RAW_MOTION_EVTS = 0x08;\n        const TYPE_BATTERY_LEVEL = 0xFE;\n        const TYPE_ERROR = 0xFF;\n\n    var value = {}\n    var p = payload;\n    var idx = 0;\n    var len = p.readUInt8(idx);\n    idx += 1;\n    var msgType = p.readUInt8(idx);\n    idx += 1;\n    \n    if(msgType === MSGTYPE_ERROR) {\n        value.error = true;\n        return value;\n    } else if(msgType !== MSGTYPE_REPORT) {\n        value.unknown_msg = true;\n        return value;\n    }\n    \n    var v;\n    while(idx < payload.length)\n    {\n        var dataType = payload[idx++];\n        //console.log(idx, \"-->\", dataType);\n        switch(dataType) {\n            case TYPE_TEMPERATURE:\n                v = payload.readInt16BE(idx) / 100.0;\n                idx += 2;\n                value.temperature = v;\n                break;\n            case TYPE_HUMIDITY:\n                v = (payload.readUInt16BE(idx) / 65536)*125 - 6;\n                idx += 2;\n                value.humidity = v;\n                break;\n            case TYPE_OCCUPANCY:\n                // 0x00 Monitored space is free\n                // 0x01 Monitored space is occupied    \n                v = payload.readUInt8(idx) !== 0 ? true : false;\n                idx += 1;\n                value.occupancy = v;\n                break;\n            case TYPE_NUM_OCCUPIED_BLOCKS:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                value.num_occupied_blocks = v;\n                break;\n            case TYPE_NUM_MOTION_EVTS:\n                v = payload.readUInt16BE(idx);\n                idx += 2;\n                value.num_motion_events = v;\n                break;\n            case TYPE_NUM_FREE_BLOCKS:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                value.num_free_blocks = v;\n                break;\n            case TYPE_RAW_MOTION_EVTS:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                value.num_motion_events = v;\n                break;\n            case TYPE_BATTERY_LEVEL:\n                v = payload.readUInt8(idx);\n                idx += 1;\n                if(v === 0) {\n                    value.battery_level = 0;\n                    value.battery_voltage = BATTERY_SHUTDOWN_LEVEL;\n                } else if(v === 1) {\n                    value.battery_level = 1;\n                    value.battery_voltage = (BATTERY_SHUTDOWN_LEVEL + BATTERY_MIN_LEVEL) / 2;\n                }  else if(v === 254) {\n                    value.battery_level = 100;\n                    value.battery_voltage = BATTERY_MAX_LEVEL;\n                } else if(v === 255) {\n                    value.battery_level = 0;\n                    value.battery_voltage = BATTERY_SHUTDOWN_LEVEL;\n                } else {\n                    value.battery_level = ( ( 253 * ( v - BATTERY_MIN_LEVEL ) ) / ( BATTERY_MAX_LEVEL - BATTERY_MIN_LEVEL ) ) + 1;\n                    value.battery_voltage = value.battery_level * (BATTERY_MAX_LEVEL-BATTERY_MIN_LEVEL) + BATTERY_MIN_LEVEL;\n                }\n                /*\n                Type: uint8\n                Value:\n                0x00 - 0xFF\n                255: battery voltage < BATTERY_SHUTDOWN_LEVEL (1900 mV)\n                254 : battery voltage >= BATTERY_MAX_LEVEL (3300 mV)\n                253 - 2: batteryLevel = ( ( 253 * ( BatteryVoltage - BATTERY_MIN_LEVEL ) ) / ( BATTERY_MAX_LEVEL - BATTERY_MIN_LEVEL ) ) + 1;\n                1 : battery voltage between BATTERY_MIN_LEVEL (2000 mV) and BATTERY_SHUTDOWN_LEVEL (1900 mV).\n                0 : battery voltage < 1.9V\n                */\n                break;\n            default:\n                return value;\n        }\n    }\n    return value;\n  }\n}\n\nvar p = msg.payload;\n\nif(p.applicationName !== \"ALLORA_HUMIDI\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = Allora_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 500,
        "y": 1000,
        "wires": [
            [
                "a1e2e43e.10f1d"
            ]
        ]
    },
    {
        "id": "a1e2e43e.10f1d",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "allora_humidi",
        "links": [],
        "x": 835,
        "y": 1000,
        "wires": []
    },
    {
        "id": "ee192079.88c82",
        "type": "function",
        "z": "fe068cdd.273a8",
        "name": "Decode Elsys ERS",
        "func": "\nvar p = msg.payload;\n\nif(p.applicationName !== \"ELSYS_ERS\") {\n    return undefined;\n}\n\nif(! p.frmPayload) {\n    return undefined;\n}\n\nvar o = Allora_Payload.decodeUp(p.fPort,p.frmPayload);\n\nmsg.payload.object = o;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 510,
        "y": 1060,
        "wires": [
            []
        ]
    },
    {
        "id": "afb54073.becdf",
        "type": "link out",
        "z": "fe068cdd.273a8",
        "name": "geoloc_device",
        "links": [
            "c8c17d9.2aa9b"
        ],
        "x": 835,
        "y": 80,
        "wires": []
    },
    {
        "id": "19c6ec90.dfeadb",
        "type": "comment",
        "z": "fe068cdd.273a8",
        "name": "Flow for decoding device payloads",
        "info": "",
        "x": 260,
        "y": 120,
        "wires": []
    }
]
