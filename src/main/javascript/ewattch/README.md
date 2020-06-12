https://flows.nodered.org/flow/04fb29893b519f23b39e2d5fc4259915

```
[{
	"id": "4830a254.c8ad14",
	"type": "function",
	"z": "4c2beb28.33872c",
	"name": "Decode-Ewattch-Payload",
	"func": "var lengthpayload = msg.payload.length;\nvar temperature;\nvar humidity;\nvar presence;\nvar luminosity;\nvar co2;\n\nif(msg.hardware_serial.includes(\"70B3\")){\n    for(var i=2;i<(lengthpayload-2);i++){\n    switch(msg.payload[i]){\n        case 0x00:  // temperature\n            temperature=msg.payload[i+2]*0x100+msg.payload[i+1];\n            temperature=temperature/100.0;\n            msg.temperature=temperature;\n            i=i+2;\n            break;\n            \n        case 0x04:  // humidité\n            humidity=msg.payload[i+1]*0.5;\n            msg.humidity=humidity;\n            i=i+1;\n            break;\n            \n        case 0x08: // CO2\n            co2=msg.payload[i+2]*0x100+msg.payload[i+1];\n            msg.co2=co2;\n            i=i+2;\n            break;\n            \n        case 0x10: // luminosity\n            luminosity=msg.payload[i+2]*0x100+msg.payload[i+1];\n            msg.luminosity=luminosity*1.0;\n            i=i+2;\n        break;\n        \n        case 0x14:  //presence\n            presence=msg.payload[i+2]*0x100+msg.payload[i+1];\n            msg.presence=presence*1.0;\n            i=i+2;\n        break;\n    \n    }\n}\n\nmsg.payload={\n     Dates : msg.payload.timestamp,\n     DevEUID : msg.hardware_serial,\n     Temperature : temperature,\n     Humidity : humidity,\n     Luminosity : luminosity,\n     Presence : presence,\n     CO2 : co2\n    }\nreturn msg\n}",
	"outputs": "1",
	"noerr": 0,
	"x": 570,
	"y": 300,
	"wires": [
		["ab8787b1.11626", "ca15188d.53ab08", "3eab46c7.5b3b92"]
	],
	"outputLabels": ["msg"]
}]
```
