
/* 
 * Decoder function for The Things Network to unpack the payload
 * of MCF88's LW12TERPM (LoRaWAN® outdoor PM and environmental sensor)
 * https://www.mcf88.it/prodotto/mcf-lw12terpm/
 */

// Constantes d'approximation
// Voir http://en.wikipedia.org/wiki/Dew_point pour plus de constantes
var a = 17.27;
var b = 237.7;

/** Fonction de calcul rapide du point de rosée (dew point) en fonction de la température et de l'humidité ambiante */
function dewPoint(celsius, humidity) {
  // Calcul (approximation)
  var temp = (a * celsius) / (b + celsius) + Math.log(humidity * 0.01);
  return (b * temp) / (a - temp);
}


function Decoder(bytes, fport) {

    var MEASUREMENT_PERIOD = 15*60; // in seconds
    var params = {
    }

    // Time sync request
    if (0x01 === bytes[0]) {
        params.payload_type = "time";
        params.sync_id = (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
    }

    // Report data
    else if (0x0b === bytes[0] && bytes.length === 19) {

        var series = [];

        params.payload_type = "report_data"
        // Sign-extend to 32 bits to support negative values, by shifting 24 bits
        // (16 too far) to the left, followed by a sign-propagating right shift:
        params.temperature = (bytes[8] << 24 >> 16 | bytes[7]) / 100;
        params.humidity = bytes[9] / 2;   // RH is doubled
        params.pressure = ((bytes[12] << 16) | bytes[11] << 8 | bytes[10])/100.0;   // hPa
        params.pm1 = (bytes[14] << 8) | bytes[13];   // pm1.0 μg/m3
        params.pm2_5 = (bytes[16] << 8) | bytes[15];   // pm2.5 μg/m3
        params.pm10 = (bytes[18] << 8) | bytes[17];   // pm10 μg/m3
        params.dewpoint = dewPoint(params.temperature, params.humidity);

        
        params.year = 2000 + (bytes[2+4] >> 1);
        params.month = ((bytes[2+4] & 0x01) << 3) | (bytes[2+3] >> 5);
        params.day = bytes[2+3] & 0x1f;
        params.hours = bytes[2+2] >> 3;
        params.minutes = ((bytes[2+2] & 0x7) << 3) | (bytes[2+1] >> 5);
        params.seconds = bytes[2+1] & 0x1f;

        var month = [" Jan "," Feb "," Mar "," Apr "," May "," Jun "," Jul "," Aug "," Sep "," Oct "," Nov "," Dec "];
        var date = ((params.day<10) ? "0" : "") + params.day + month[params.month-1] + params.year
          + " " +((params.hours<10) ? "0" : "") + params.hours
          + ":" + ((params.minutes<10) ? "0" : "") + params.minutes
          + ":" + ((params.seconds<10) ? "0" : "") + params.seconds
          + " GMT"
        ;

        // params.epoch = Date.parse(date); 
        
        params.uplinkID = bytes[0];
        params.reportID = bytes[1];
        params.frameID = bytes[2];
        params.date = date;

        series.push({
          _timeShift: 0,
          temperature: params.temperature,
          humidity: params.humidity,
          pressure: params.pressure,
          dewpoint: dewPoint(params.temperature, params.humidity),
          pm1: params.pm1,
          pm2_5: params.pm2_5,
          pm10: params.pm10
        });

      	params.series = series;
    }

    return params

}

// For Chripstack
// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
    return Decoder(bytes, fPort)
}

//module.exports.Decoder = Decoder;
//module.exports.Decode = Decode;
