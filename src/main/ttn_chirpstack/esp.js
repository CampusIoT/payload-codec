// Compute Estimated Signal Power (ESP) 

function esp(rssi,snr) {
    return rssi + snr - (10*Math.log10(1 + Math.pow(10,0.1*snr)));
}

// console.log(esp(-112,-3));
// expected output: -116.76434862436486
