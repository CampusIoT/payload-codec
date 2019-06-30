// Javascript functions for décoding and encoding the frame payloads
// From https://github.com/feross/buffer/blob/master/index.js

function readUInt16LE (buf, offset) {
  offset = offset >>> 0;
  return buf[offset] | (buf[offset + 1] << 8);
}

function readUInt16BE (buf, offset) {
  offset = offset >>> 0;
  return (buf[offset] << 8) | buf[offset + 1];
}

function readInt16LE (buf, offset) {
  offset = offset >>> 0;
  var val = buf[offset] | (buf[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val;
}

function readInt16BE (buf, offset) {
  offset = offset >>> 0;
  var val = buf[offset + 1] | (buf[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val;
}

function readUInt32LE (buf, offset) {
  offset = offset >>> 0;

  return ((buf[offset]) |
      (buf[offset + 1] << 8) |
      (buf[offset + 2] << 16)) +
      (buf[offset + 3] * 0x1000000);
}

function readUInt32BE (buf, offset) {
  offset = offset >>> 0;

  return (buf[offset] * 0x1000000) +
    ((buf[offset + 1] << 16) |
    (buf[offset + 2] << 8) |
    buf[offset + 3]);
}

function readIntLE (buf, offset, byteLength) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  var val = buf[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += buf[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
}

function readIntBE (buf, offset, byteLength) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  var i = byteLength;
  var mul = 1;
  var val = buf[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += buf[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
}

function readInt8 (buf, offset) {
  offset = offset >>> 0;
  if (!(buf[offset] & 0x80)) return (buf[offset]);
  return ((0xff - buf[offset] + 1) * -1);
}

function readUInt8 (buf, offset) {
  offset = offset >>> 0;
  return (buf[offset]);
}

/*

// Decode the latitude returned by the Semtech LoRaMote.
// The latitude is encoded into a 24-int signed integer
//  - buf is an array of bytes
//  - offset is the offset of the field into the array of bytes
// The function must return an float between -90.0 and 90.0
function readLatitude24 (buf, offset) {
  var l  = readIntBE(buf, offset, 3);
  if(l > 0) {
    l / 0x8FFFFF
  } else {

  }
  return l;
}

// Decode the longitude returned by the Semtech LoRaMote.
// The latitude is encoded into a 24-int signed integer
//  - buf is an array of bytes
//  - offset is the offset of the field into the array of bytes
// The function must return an float between -180.0 and 180.0
function readLongitude24 (buf, offset) {
  // TODO
  return undefined;
}

*/
