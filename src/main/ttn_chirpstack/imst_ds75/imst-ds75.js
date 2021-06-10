function readInt16LE (buf, offset) {
  offset = offset >>> 0
  var val = buf[offset] | (buf[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes) {
  if(bytes.length === 2) {
  	return { temperature: readInt16LE(bytes,0)/100.0};
  } else {
    return undefined;
  }
}
