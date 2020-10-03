var argv = process.argv;
var fs = require('fs');
eval(fs.readFileSync(argv[2])+'');
var dataEncoding = argv[3];
var port = parseInt(argv[4]);
var payload = Buffer.from(argv[5], dataEncoding);
if(argv[6]) {
    // For future use
    var objectJSON = Buffer.from(argv[6]);
}

// console.log(payload.length, payload);
var arr = Array.prototype.slice.call(payload, 0)

var obj = Decoder(arr, port);
console.log(JSON.stringify(obj));
