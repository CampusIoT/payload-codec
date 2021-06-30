//
// Fonction de calcul rapide du point de rosée (dewpoint en anglais) en fonction de la température et de l'humidité relative ambiante
//

// Extra data : dewpoint
// Added by Didier DONSEZ

// Constantes d'approximation
// Voir http://en.wikipedia.org/wiki/Dew_point pour plus de constantes
var a = 17.27;
var b = 237.7;

function dewPoint(celsius, humidity) {
  // Calcul (approximation)
  var temp = (a * celsius) / (b + celsius) + Math.log(humidity * 0.01);
  return (b * temp) / (a - temp);
}
