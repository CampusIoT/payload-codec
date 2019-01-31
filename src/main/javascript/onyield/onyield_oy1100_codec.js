//*****************************************************************************
// Javascript codec functions for OnYield OY1100 endpoints
// Authors: Didier Donsez
// Licence: EPL 1.0
//*****************************************************************************

// See http://www.dataprint.fr/support/talkpool/Manuel_OY1100.pdf

OnYield_OY1100_Payload = {

  // private function
  'decodeTemp' : function (b0,b2) {
    var temp=(b0<<4)+(b2>>4);
    if( (temp & 0x0800) == 0) {
      temp = temp / 10.0;
    } else {
      temp = (temp | 0xFFFFF000);
      temp = - (~temp+1) / 10.0;
    }
    return temp;
  },

  // private function
  'decodeHum' : function (b1,b2) {
    return ((b1<<4)+(b2&0x0F))/10.0;
  },

  // public function
  'decodeUp': function (port,payload) {
    var p = payload;
    var object = {
      // current temperature
      temperature: this.decodeTemp(p[6],p[8]),
      // current humidity
      humidity: this.decodeHum(p[7],p[8]),
      // temperature 2 hours before
      temperature2hours: this.decodeTemp(p[3],p[5]),
      // humidity 2 hours before
      humidity2hours: this.decodeHum(p[4],p[5]),
      // temperature 4 hours before
      temperature4hours: this.decodeTemp(p[0],p[2]),
      // humidity 4 hours before
      humidity4hours: this.decodeHum(p[1],p[2])
    };
    return object;
  }
};

module.exports.Decoder = OnYield_OY1100_Payload;

/*
var frame= {
  data: "121AD7121A46E919CE",
  temperature: -35.6,
  humidity: 41.4,
  temperature2hours: 29.2,
  humidity2hours: 42.9,
  temperature4hours: 30.1,
  humidity4hours: 42.3
};

var p = Buffer.from(frame.data, "hex");

var o = OnYield_OY1100_Payload.decodeUp(0,p);

console.log(JSON.stringify(frame,undefined,2));
console.log(JSON.stringify(o,undefined,2));
*/
