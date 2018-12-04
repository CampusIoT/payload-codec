// Derived from http://stackoverflow.com/a/8545403/106786
function decodeFloat(bytes, pos, size, signBits, exponentBits, fractionBits, eMin, eMax, littleEndian) {
  var totalBits = (signBits + exponentBits + fractionBits);

  var binary = "";
  for (var i = pos, l = size; i < l; i++) {
    var bits = bytes[i].toString(2);
    while (bits.length < 8)
      bits = "0" + bits;

    if (littleEndian)
      binary = bits + binary;
    else
      binary += bits;
  }

  var sign = (binary.charAt(0) == '1')?-1:1;
  var exponent = parseInt(binary.substr(signBits, exponentBits), 2) - eMax;
  var significandBase = binary.substr(signBits + exponentBits, fractionBits);
  var significandBin = '1'+significandBase;
  var i = 0;
  var val = 1;
  var significand = 0;

  if (exponent == -eMax) {
      if (significandBase.indexOf('1') == -1)
          return 0;
      else {
          exponent = eMin;
          significandBin = '0'+significandBase;
      }
  }

  while (i < significandBin.length) {
      significand += val * parseInt(significandBin.charAt(i));
      val = val / 2;
      i++;
  }

  return sign * significand * Math.pow(2, exponent);
}

function readFloat(bytes, pos) {
      return decodeFloat(bytes, pos, 4, 1, 8, 23, -126, 127, true);
}

// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
  var len = bytes.length;

  var res = {};
  //res.raw = [];
  //bytes.forEach(function(e) { res.raw.push(e.toString(16));});

  if((fPort === 8) && (len === 12)) {
    res.type = "MOTION";
    res.x = readFloat(bytes,0);
    res.y = readFloat(bytes,4);
    res.z = readFloat(bytes,8);
  } else if(((fPort === 1) || (fPort === 7)) && (len === 25)) {

    if(fPort === 1) {
       res.type = "REPORT";
    } else {
       res.type = "BUTTON";
    }
    res.x = readFloat(bytes,0);
    res.y = readFloat(bytes,4);
    res.z = readFloat(bytes,8);
    res.temperature = readFloat(bytes,12);
    res.humidity = readFloat(bytes,16);
    res.pressure = readFloat(bytes,20);
    res.batteryLevel = bytes[24];
  } else {
    res.type = "UNKNOWN";
  }
  return res;
}
