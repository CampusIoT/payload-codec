//*****************************************************************************
// Javascript codec functions for Atmo Air Quality Station endpoints
// Authors: Didier Donsez
// Licence: EPL 1.0
//*****************************************************************************

/*
2 Octet d'en tête
bit 0 : Température
Si à 1, Mesure présente dans la trame.
Plage de mesure : -30;97°C
Précision : 0,5°C
Nombre d’octet : 1
Big endian
Format : entier
(temp(°C) + 30)*2= data
temp(°C) = (data/2) -30

bit 1 : Humidité
Si à 1, Mesure présente dans la trame.
Plage de mesure : 0;100%
Précision : 0,5%
Nombre d’octet : 1
Big endian
Format : entier
humidité (%)*2 = data
humidité (%) = data/2

bit 2 : Pression
Si à 1, Mesure présente dans la trame.
Plage de mesure : 900;1100 hPa
Précision : 1 hPa
Nombre d’octet : 1
Big endian
Format : entier
pression (hPa) - 900 = data
pression (hPa) = data + 900

bit 3 : PM10
Si à 1, Mesure présente dans la trame.
Plage de mesure : 0-1000 µg/m3
Précision : 1 µg/m3
Nombre d’octet : 2
Big endian
Format : entier

bit 4 : PM2,5
Si à 1, Mesure présente dans la trame.
Plage de mesure : 0-1000 µg/m3
Précision : 1 µg/m3
Nombre d’octet : 2

Big endian
Format : entier

bit 5 : VOC
Si à 1, Mesure présente dans la trame.
Plage de mesure : 0-60000 ppm
Précision : 1 ppb
Nombre d’octet : 2
Big endian
Format : entier

bit 6 : ECO2
Si à 1, Mesure présente dans la trame.
Plage de mesure : 400-60000 ppm
Précision : 1
Nombre d’octet : 2
Big endian
Format : entier

bit 7 : CO2 (pas encore de capteur à disposition)
Si à 1, Mesure présente dans la trame.
Plage de mesure : ?
Précision :?
Nombre d’octet :?

bit 8 : Gaz NO2
Si à 1, Mesure présente dans la trame.
Plage de mesure : 0;20000 ppb
Précision : 0,5 ppb
Nombre d’octet : 2
Big endian
Format: entier
data*0.5=ppb NO2
2*ppb NO2= data

bit 9 : Gaz O3
Si à 1, Mesure présente dans la trame.
Plage de mesure : 0;20000 ppb
Précision : 0,5 ppb
Nombre d’octet : 2
Big endian
Format: entier
data*0.5=ppb O3
2*ppb NO2= data

bit 10 :  GNSS
Si à 1, position présente dans la trame.
Nombre d’octet : 8 octets
1 float single precision IEEE 754 : latitude décimal
1 float single precision IEEE 754 : longitude décimal

bit 11 :  GNSS
si à 1 la position est considérée identique à la dernière reçu
0 octet

bit 14 : Heure (dans un deuxième temps)
si la transmission a été reporter (dutycycle, indisponibilité du serveur) transmission de l’heure du gps à laquelle la mesure a été prise (bit à 1). Si bit à 0, on prendra en compte l’heure de réception des donnée sur la gateway

bit 15 :  Erreur
Si a 1, la trame inclue un code d’erreur ( codes d’erreurs 0-255 : https://docs.google.com/spreadsheets/d/12qM_7QE60YMlRhexVBLeQa3nxUcu0zQzzAYFlIMsXpc)
Nombre d’octet : 1
Entier

Transmission des données
Les mesures seront ensuite concaténé à la suite de l’en tête, en fonction des bit 1 dans celle-ci. Les mesure sont dans l'ordre bit0 => bit15.
Et l'entête est en Big Endian = bit 15 à bit 0.



*/
Atmo_QoA_Payload = {
    'decodeUp': function (port,payload) {

      var FLAG_TEMP = 0x01;
      var FLAG_HUM = 0x02;
      var FLAG_PRES = 0x04;
      var FLAG_PM10 = 0x08;
      var FLAG_PM25 = 0x10;
      var FLAG_VOC = 0x20;
      var FLAG_ECO2 = 0x40;
      var FLAG_CO2 = 0x80;
      var FLAG_NO2 = 0x0100;
      var FLAG_O3 = 0x0200;
      var FLAG_GNSS = 0x0400;
      var FLAG_GNSSPREV = 0x0800;
      var FLAG_HOUR = 0x4000;
      var FLAG_ERROR = 0x8000;

      var p = payload;
      var l = p.length;

	  if (l >= 2) {
        var index = 2;
        var h = p.readUInt16BE(0);

	    	var value = {};

        if((h & FLAG_TEMP) !== 0) {
          if((index + 1) <= l) {
            var data = p.readUInt8(index);
  	        value["temperature"]=(data/2.0) - 30;
            index += 1;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_HUM) !== 0) {
          if((index + 1) <= l) {
            var data = p.readUInt8(index);
  	        value["humidity"]=(data/2.0);
            index += 1;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_PRES) !== 0) {
          if((index + 1) <= l) {
            var data = p.readUInt8(index);
  	        value["pressure"]=(data+900);
            index += 1;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_PM10) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["pm10"]=(data);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_PM25) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["pm25"]=(data);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_VOC) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["voc"]=(data);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_ECO2) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["eco2"]=(data);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_CO2) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["co2"]=(data);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_NO2) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["no2"]=(data*0.5);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_O3) !== 0) {
          if((index + 2) <= l) {
            var data = p.readUInt16BE(index);
  	        value["o3"]=(data*0.5);
            index += 2;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_GNSS) !== 0) {
          if((index + 8) <= l) {
            var lat = p.readFloat(index);
  	        value["latitude"]=(lat);
            index += 4;
            var lng = p.readFloat(index);
  	        value["longitude"]=(lng);
            index += 4;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

        if((h & FLAG_GNSSPREV) !== 0) {
          value["gnss_prev"]=true;
        }

        if((h & FLAG_HOUR) !== 0) {
          value["hour"]=true;
        }

        if((h & FLAG_ERROR) !== 0) {
          if((index + 1) <= l) {
            var data = p.readUInt8(index);
  	        value["error"]=data;
            index += 1;
          } else {
            value["overflow"] = true;
            return value;
          }
        }

	    	return value;
	    } else {
        return undefined;
      }
	}
}

module.exports.Decoder = Atmo_QoA_Payload;
