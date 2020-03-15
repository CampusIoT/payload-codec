var argv = process.argv;
var fs = require('fs');
eval(fs.readFileSync(argv[2])+'');
var payload = Buffer.from(argv[3], "hex");
// console.log(payload.length, payload);
var arr = Array.prototype.slice.call(payload, 0)
var obj = Decoder(arr, 0);
console.log(JSON.stringify(obj));
