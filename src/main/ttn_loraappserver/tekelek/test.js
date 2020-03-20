var argv = process.argv;
var fs = require('fs');
eval(fs.readFileSync(argv[2])+'');
var port = parseInt(argv[3]);
var payload = Buffer.from(argv[4], "hex");
// console.log(payload.length, payload);
var arr = Array.prototype.slice.call(payload, 0)

var obj = Decoder(arr, port);
console.log(JSON.stringify(obj));
