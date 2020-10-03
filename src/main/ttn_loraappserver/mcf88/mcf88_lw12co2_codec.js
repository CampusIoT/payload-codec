
/* 
 * Decoder function for The Things Network to unpack the payload of MCF88's LW12CO2
 * More info on the sensors/buy online:
 * https://connectedthings.store/gb/home-and-office-sensors/mcf88-lorawan-indoor-environmental-sensor-with-voc-lux-and-co2.html
 * This function was created by Al Bennett at Sensational Systems - al@sensational.systems
 */



// Constantes d'approximation
// Voir http://en.wikipedia.org/wiki/Dew_point pour plus de constantes
var a = 17.27;
var b = 237.7;

/** Fonction de calcul rapide du point de rosée en fonction de la température et de l'humidité ambiante */
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

    // Handle measurement packets
    else if (0x0e === bytes[0]) {

        if (bytes[33]) {
            params.battery_percentage = bytes[33];
        }

        var series = [];

        params.payload_type = "measurement"
        // Sign-extend to 32 bits to support negative values, by shifting 24 bits
        // (16 too far) to the left, followed by a sign-propagating right shift:
        params.temperature_1 = (bytes[6] << 24 >> 16 | bytes[5]) / 100;
        params.humidity_1 = bytes[7] / 2;   // RH is doubled
        params.pressure_1 = (bytes[10] << 16) | (bytes[9] << 8) | bytes[8];  // In Pascals
        params.illumination_1 = (bytes[12] << 8) | bytes[11];   // lux
        params.voc_1 = (bytes[14] << 8) | bytes[13];   // voc
        params.co2_1 = (bytes[16] << 8) | bytes[15];   // co2

        params.year_1 = 2000 + (bytes[4] >> 1);
        params.month_1 = ((bytes[4] & 0x01) << 3) | (bytes[3] >> 5);
        params.day_1 = bytes[3] & 0x1f;
        params.hours_1 = bytes[2] >> 3;
        params.minutes_1 = ((bytes[2] & 0x7) << 3) | (bytes[1] >> 5);
        params.seconds_1 = bytes[1] & 0x1f;

        series.push({
          _timeShift: -MEASUREMENT_PERIOD,
          temperature: params.temperature_1,
          humidity: params.humidity_1,
          pressure: params.pressure_1,
          illumination: params.illumination_1,
          dewpoint: dewPoint(params.temperature_1, params.humidity_1),
          voc: params.voc_1,
          co2: params.co2_1
        });

        // Sign-extend to 32 bits to support negative values, by shifting 24 bits
        // (16 too far) to the left, followed by a sign-propagating right shift:
        params.temperature_2 = (bytes[22] << 24 >> 16 | bytes[21]) / 100;
        params.humidity_2 = bytes[23] / 2;   // RH is doubled
        params.pressure_2 = (bytes[26] << 16) | (bytes[25] << 8) | bytes[24];  // In Pascals
        params.illumination_2 = (bytes[28] << 8) | bytes[27];   // lux
        params.voc_2 = (bytes[30] << 8) | bytes[29];   // voc
        params.co2_2 = (bytes[32] << 8) | bytes[31];   // co2

        params.year_2 = 2000 + (bytes[20] >> 1);
        params.month_2 = ((bytes[20] & 0x01) << 3) | (bytes[19] >> 5);
        params.day_2 = bytes[19] & 0x1f;
        params.hours_2 = bytes[18] >> 3;
        params.minutes_2 = ((bytes[18] & 0x7) << 3) | (bytes[17] >> 5);
        params.seconds_2 = bytes[17] & 0x1f;

        series.push({
          _timeShift: 0,
          temperature: params.temperature_2,
          humidity: params.humidity_2,
          pressure: params.pressure_2,
          illumination: params.illumination_2,
          dewpoint: dewPoint(params.temperature_2, params.humidity_2),
          voc: params.voc_2,
          co2: params.co2_2,
          battery_percentage: params.battery_percentage
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
